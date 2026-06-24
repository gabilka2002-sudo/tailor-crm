export function LoadingState() {
  return (
    <div className="app-state">
      <div className="app-state-card">
        <div className="loader" />

        <h2>Загрузка CRM...</h2>
        <p>Подключаемся к backend и загружаем данные.</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="app-state">
      <div className="app-state-card error-state">
        <div className="error-icon">!</div>

        <h2>Не удалось загрузить CRM</h2>
        <p>{message || "Проверь, запущен ли backend на порту 4000."}</p>

        <button type="button" onClick={onRetry} className="new-order-button">
          Повторить
        </button>
      </div>
    </div>
  );
}