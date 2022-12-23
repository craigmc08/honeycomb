import React, { useState, createContext, useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

import './Modal.css';
import { useDocumentListener } from '../documentListener';

const ModalContext = createContext([[], () => void 0]);
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
  const Component = modals[0];

  return (
    <div className="modal-container" onClick={closeModal} aria-hidden={!isShown}>
      { Component && <Component closeModal={closeModal} /> }
    </div>
  );
}

/**
 * `useModal(component)`
 * @param {ReactElement} component
 *
 * `component` can use a `closeModal` prop, which is a function used to close
 * the modal.
 *
 * Consider using the `ModalX` elements to get a consistent layout:
 *
 * ```
 * <ModalLayout>
 *   <ModalTitle closeModal={props.closeModal}>{title}</ModalTitle>
 *   <ModalBody>{body}</ModalBody>
 *   <ModalActions>{action buttons}</ModalActions>
 * </ModalLayout>
 * ```
 *
 * Classes for modal action buttons: modal-action, primary, warn
 */
function useModal(Component) {
  const [modals, setModals] = useModalCtx();

  return {
    open: () => {
      setModals([Component, ...modals]);
    },
  };
}

function ModalLayout(props) {
  return (
    <div className="modal" onClick={e => e.stopPropagation()}> {/* to prevent closing the modal when clicking in side it */}
      {props.children}
    </div>
  );
}
function ModalTitle(props) {
  return (
    <div className="modal-header">
      <h1>{props.children}</h1>
      <button className="modal-close" onClick={() => props.closeModal()}>
        <FontAwesomeIcon icon={faX} />
      </button>
    </div>
  );
}
function ModalBody(props) {
  return (
    <div className="modal-body">
      {props.children}
    </div>
  );
}
function ModalActions(props) {
  return (
    <ul className="modal-actions">
      {props.children.map((action, i) => (<li key={i}>{action}</li>))}
    </ul>
  );
}

export {
  ModalProvider,
  useModal,
  ModalLayout,
  ModalTitle,
  ModalBody,
  ModalActions,
};
