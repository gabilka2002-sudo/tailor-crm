import { useCrm } from "../context/CrmContext";

export default function RightPanel() {
  // Берем реальные примерки из общего CRM-хранилища
  const { fittings } = useCrm();

  // Считаем примерки по статусам
  const plannedFittings = fittings.filter(
    (fitting) => fitting.status === "Запланирована"
  );

  const completedFittings = fittings.filter(
    (fitting) => fitting.status === "Прошла"
  );

  const cancelledFittings = fittings.filter(
    (fitting) => fitting.status === "Отменена"
  );

  // На главной показываем только 5 ближайших/последних примерок
  const latestFittings = fittings.slice(0, 5);

  return (
    <aside className="right-panel">
      <div className="panel-card">
        <h2>Примерки</h2>

        <div className="measurements-grid">
          <span>Запланировано: {plannedFittings.length}</span>
          <span>Прошло: {completedFittings.length}</span>
          <span>Отменено: {cancelledFittings.length}</span>
        </div>
      </div>

      <div className="panel-card">
        <h2>Ближайшие примерки</h2>

        <div className="clients-list">
          {latestFittings.map((fitting) => (
            <div className="client-item" key={fitting.id}>
              <div className="client-avatar">{fitting.client[0]}</div>

              <div>
                <strong>{fitting.client}</strong>
                <p>
                  {fitting.date} в {fitting.time}
                </p>
                <p>Заказ: {fitting.order}</p>
              </div>

              <span>{fitting.status}</span>
            </div>
          ))}

          {latestFittings.length === 0 && (
            <p style={{ padding: "16px", color: "#777" }}>
              Примерок пока нет
            </p>
          )}
        </div>
      </div>

      <div className="panel-card">
        <h2>Подсказка</h2>

        <p style={{ color: "#777", lineHeight: "1.6" }}>
          Чтобы CRM была полезной для ателье, у каждого клиента должны быть
          замеры, у каждого заказа — статус, а у каждой примерки — дата и время.
        </p>
      </div>
    </aside>
  );
}