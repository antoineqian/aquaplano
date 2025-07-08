import "./modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose}>
      <div className={`modal ${isOpen ? "animate" : ""}`} onClick={(e) => e.stopPropagation()}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 280" preserveAspectRatio="xMidYMid meet">
          <line id="svg_3" x1="2.0" y1="2.0" x2="558" y2="2.0" />
          <line id="svg_4" x1="558" y1="278" x2="558" y2="2.0" />
          <line id="svg_2" x1="2.0" y1="278" x2="558" y2="278" />
          <line id="svg_5" x1="2.0" y1="2.0" x2="2.0" y2="278" />
        </svg>
        <div className="modal-inner">
          <a href="#" className="modal-close" onClick={onClose} title="Close Modal">X</a>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;