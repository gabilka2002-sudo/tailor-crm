export default function EmptyState({ title, text, buttonText, onButtonClick }) {
  return (
    <div
      className="orders-card"
      style={{
        padding: "32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: "40px" }}>🧵</div>

      <h2 style={{ margin: 0 }}>{title}</h2>

      <p style={{ margin: 0, color: "#6b7280", maxWidth: "420px" }}>
        {text}
      </p>

      {buttonText && onButtonClick && (
        <button
          type="button"
          className="new-order-button"
          onClick={onButtonClick}
          style={{ marginTop: "8px" }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}