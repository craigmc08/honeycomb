import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

import './Modal.css';
import { useDocumentListener } from '../documentListener';

const ModalContext = createContext([null, () => void 0]);
const useModalCtx = () => useContext(ModalContext);

function ModalProvider(props) {
  const [state, setState] = useState([]);

  return (
    <ModalContext.Provider value={[state, setState]}>
      {props.children}
      <ModalBox />
    </ModalContext.Provider>
  );
}

function ModalBox(props) {
  const [modal] = useModalCtx();

  useDocumentListener('keyup', (e) => {
    if (e.key === 'Escape') {
      if (modal.setOpen) {
        modal.setOpen(false);
      }
    }
  });

  const isShown = !!modal.el;

  return (
    <div className="modal-container" onClick={() => modal.setOpen(false)} aria-hidden={!isShown}>
      {isShown && modal.el}
    </div>
  );
}

function Modal(props) {
  const [_, setModal] = useModalCtx();
  if (props.open) {
    setModal({
      setOpen: props.setOpen,
      el: (
        <div className="modal" onClick={e => e.stopPropagation()}> {/* to prevent closing the modal when clicking in side it */}
          {props.children}
        </div>
      ),
    });
  } else {
    setModal(null);
  }

  return null;
}
Modal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func.isRequired,
};

function ModalHeader(props) {
  return (
    <div className="modal-header">
      {props.children}
    </div>
  );
}
function ModalTitle(props) {
  return (
    <h1>{props.children}</h1>
  );
}
function ModalCloseButton(props) {
  return (
    <button className="modal-close" onClick={() => props.setOpen(false)}>
      <FontAwesomeIcon icon={faX} />
    </button>
  );
}
ModalCloseButton.propTypes = {
  setOpen: PropTypes.func.isRequired,
};

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
  Modal,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  ModalActions,
};
