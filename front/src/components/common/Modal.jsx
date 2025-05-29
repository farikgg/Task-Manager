import React from 'react';
import '../../styles/modal.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-bg">
      <div className="modal-window">
        <button
          onClick={onClose}
          className="modal-close"
          aria-label="Закрыть"
        >
          ×
        </button>
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal; 