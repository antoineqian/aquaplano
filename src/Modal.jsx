import "./modal.css";
import { useEffect, useState } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = requestAnimationFrame(() => {
        setShowAnimation(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className={`overlay show`} onClick={onClose}>
      <div className={`modal ${showAnimation ? "animate" : ""}`} onClick={(e) => e.stopPropagation()}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 280" preserveAspectRatio="xMidYMid meet">
          <line id="svg_3" x1="-2.0" y1="2.0" x2="560" y2="2.0" />
          <line id="svg_4" x1="558" y1="278" x2="558" y2="2.0" />
          <line id="svg_2" x1="-2.0" y1="278" x2="560" y2="278" />
          <line id="svg_5" x1="2.0" y1="2.0" x2="2.0" y2="278" />
        </svg>
        <div className={`modal-inner ${showAnimation ? "animate" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;