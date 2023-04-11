import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

import './Modal.css';

// TODO: for some reason the close transition for the modal doesnt work, but it
// does work for the overlay
export function Modal(props) {
	return (
		<ReactModal
			className={{
				base: 'modal',
				afterOpen: 'modal--after-open',
				beforeClose: 'modal--before-close',
			}}
			overlayClassName={{
				base: 'modal-overlay',
				afterOpen: 'modal-overlay--after-open',
				beforeClose: 'modal-overlay--before-close',
			}}
			closeTimeoutMS={200}
			{...props}
		>
			{props.children}
		</ReactModal>
	);
}

export function ModalTitle(props) {
	return (
		<div className="modal-header">
			<h1>{props.children}</h1>
			<button className="modal-close" onClick={props.requestClose}>
				<FontAwesomeIcon icon={faX} />
			</button>
		</div>
	);
}

export function ModalBody(props) {
	return (
		<div className="modal-body">
			{props.children}
		</div>
	);
}

export function ModalActions(props) {
	return (
		<ul className="modal-actions">
			{props.children.map((action, i) => (<li key={i}>{action}</li>))}
		</ul>
	);
}

export function ModalAction(props) {
	let className = 'modal-action';
	if (props.warn) {
		className += ' warn';
	}

	const onClick = () => {
		if (props.requestClose) props.requestClose();
		if (props.action) props.action();
	}

	return (
		<button className={className} onClick={onClick}>
			{props.children}
		</button>
	);
}
