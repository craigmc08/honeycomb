import React, { useState, createContext, useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

import './Modal.css';
import { useDocumentListener } from '../documentListener';

const ModalContext = createContext([[], ([]) => void 0]);
const useModalCtx = () => useContext(ModalContext);

function ModalProvider(props) {
  const [state, setState] = useState([]);

  return (
    <ModalContext.Provider value={[state, setState]}>
      {props.children}
      <Modal />
    </ModalContext.Provider>
  );
}

function Modal(props) {
  const [modals, setModals] = useModalCtx();

  const closeModal = () => {
    setModals(modals.slice(1));
  };

  useDocumentListener('keyup', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  const isShown = modals.length > 0;
  const modal = modals[0] && modals[0](closeModal);

  return (
    <div className="modal-container" onClick={closeModal} aria-hidden={!isShown}>
      <div className="modal" onClick={(e) => e.stopPropagation()}> {/* to prevent closing the modal when clicking in it */}
        <div className="modal-header">
          <h1>{modal && modal.title}</h1>
          <button className="modal-close" onClick={() => closeModal()}>
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>
        <div className="modal-body">
          {modal && modal.body}
        </div>
        <ul className="modal-actions">
          {modal && modal.actions.map((action, i) => (<li key={i}>{action}</li>))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Pass in a function that takes in a `closeModal` function and returns a modal
 * object:
 * 
 * ```
 * {
 *  title: string,
 *  body: ReactElement[],
 *  actions: ReactElement[],
 * }
 * ```
 * 
 * Classes for modal action buttons: modal-action, primary, warn
 */
function useModal(builder) {
  const [modals, setModals] = useModalCtx();

  return {
    open: () => {
      setModals([builder, ...modals]);
    },
  };
}

export {
  ModalProvider,
  useModal,
}
