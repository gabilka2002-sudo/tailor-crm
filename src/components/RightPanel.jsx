import { useCrm } from "../context/CrmContext";

function parseDate(dateString) {
  // Поддерживаем два формата дат:
  // "20.07.2026" и "2026-07-20"
  if (!dateString) return null;

  if (dateString.includes(".")) {
    const [day, month, year] = dateString.split(".");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(dateString);
}

function isToday(dateString) {
  const date = parseDate(dateString);

  if (!date) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function RightPanel() {
  // Берем реальные заказы и примерки из общего CRM-хранилища
  const { orders, fittings } = useCrm();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Заказы, которые просрочены и ещё не готовы
  const overdueOrders = orders.filter((order) => {
    const deadline = parseDate(order.deadline);

    if (!deadline) return false;

    return deadline < today && order.status !== "Готово";
  });

  // Заказы, которые уже готовы и их можно выдавать клиенту
  const readyOrders = orders.filter((order) => order.status === "Готово");

  // Примерки на сегодня
  const todayFittings = fittings.filter(
    (fitting) =>
      fitting.status === "Запланирована" && isToday(fitting.date)
  );

  // Ближайшие примерки: сортируем по дате и времени
  const upcomingFittings = fittings
    .filter((fitting) => fitting.status === "Запланирована")
    .sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);

      if (!dateA || !dateB) return 0;

      return dateA - dateB;
    })
    .slice(0, 5);

  return (
    <aside className="right-panel">
      <div className="panel-card">
        <h2>Сегодня</h2>

        <div className="measurements-grid">
          <span>Примерки сегодня: {todayFittings.length}</span>
          <span>Готово к выдаче: {readyOrders.length}</span>
          <span>Просрочено: {overdueOrders.length}</span>
        </div>
      </div>

      <div className="panel-card">
        <h2>Ближайшие примерки</h2>

        <div className="clients-list">
          {upcomingFittings.map((fitting) => (
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

          {upcomingFittings.length === 0 && (
            <p style={{ padding: "16px", color: "#777" }}>
              Ближайших примерок нет
            </p>
          )}
        </div>
      </div>

      <div className="panel-card">
        <h2>Готово к выдаче</h2>

        <div className="clients-list">
          {readyOrders.slice(0, 5).map((order) => (
            <div className="client-item" key={order.id}>
              <div className="client-avatar">{order.client[0]}</div>

              <div>
                <strong>{order.client}</strong>
                <p>{order.product}</p>
                <p>Заказ: {order.id}</p>
              </div>

              <span>{order.price}</span>
            </div>
          ))}

          {readyOrders.length === 0 && (
            <p style={{ padding: "16px", color: "#777" }}>
              Готовых заказов пока нет
            </p>
          )}
        </div>
      </div>

      <div className="panel-card">
        <h2>Риски</h2>

        <div className="clients-list">
          {overdueOrders.slice(0, 5).map((order) => (
            <div className="client-item" key={order.id}>
              <div className="client-avatar">!</div>

              <div>
                <strong>{order.client}</strong>
                <p>{order.product}</p>
                <p>Срок: {order.deadline}</p>
              </div>

              <span>{order.status}</span>
            </div>
          ))}

          {overdueOrders.length === 0 && (
            <p style={{ padding: "16px", color: "#777" }}>
              Просроченных заказов нет
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}