import { useEffect } from "react";

export default function Modal({ title, children, onClose }) {
  // Закрываем модальное окно по клавише Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="client-modal"
        onClick={(event) => {
          // Важно: клик внутри модалки не должен закрывать окно
          event.stopPropagation();
        }}
      >
        <div className="modal-head">
          <h2>{title}</h2>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}