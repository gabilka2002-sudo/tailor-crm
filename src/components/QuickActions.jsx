export default function QuickActions({ setPage }) {
  // Переход на существующие страницы CRM
  function goToPage(pageName) {
    setPage(pageName);
  }

  // Временное сообщение для разделов, которые мы ещё не создавали
  function showComingSoon(sectionName) {
    alert(`Раздел "${sectionName}" будет добавлен позже`);
  }

  return (
    <div className="orders-card">
      <div className="card-head">
        <h2>Быстрые действия</h2>
      </div>

      <div className="measurements-grid">
        <button
          className="new-order-button"
          onClick={() => goToPage("orders")}
        >
          + Новый заказ
        </button>

        <button
          className="new-order-button"
          onClick={() => goToPage("clients")}
        >
          Клиенты
        </button>

        <button
          className="new-order-button"
          onClick={() => showComingSoon("Изделия")}
        >
          Изделия
        </button>

        <button
          className="new-order-button"
          onClick={() => showComingSoon("Платежи")}
        >
          Платежи
        </button>

        <button
          className="new-order-button"
          onClick={() => goToPage("fittings")}
        >
          Примерки
        </button>

        <button
          className="new-order-button"
          onClick={() => goToPage("settings")}
        >
          Отчёты / Экспорт
        </button>
      </div>
    </div>
  );
}