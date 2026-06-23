import { useCrm } from "../context/CrmContext";

function parseDate(dateString) {
  // В проекте даты могут быть в формате "20.07.2026" или "2026-07-20".
  // Эта функция приводит оба формата к обычной JavaScript Date.
  if (!dateString) return null;

  if (dateString.includes(".")) {
    const [day, month, year] = dateString.split(".");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(dateString);
}

export default function StatsCards() {
  // Берем реальные заказы, клиентов и примерки из общего CRM-хранилища
  const { orders, clients, fittings } = useCrm();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Активные заказы — это всё, что ещё не готово
  const activeOrders = orders.filter(
    (order) => order.status === "В работе" || order.status === "Примерка"
  );

  // Готовые заказы
  const completedOrders = orders.filter((order) => order.status === "Готово");

  // Просроченные заказы: срок меньше сегодняшней даты и заказ ещё не готов
  const overdueOrders = orders.filter((order) => {
    const deadline = parseDate(order.deadline);

    if (!deadline) return false;

    return deadline < today && order.status !== "Готово";
  });

  // Запланированные примерки
  const plannedFittings = fittings.filter(
    (fitting) => fitting.status === "Запланирована"
  );

  // Считаем общую сумму заказов
  const totalRevenue = orders.reduce((sum, order) => {
    const numericPrice = Number(String(order.price).replace(/\D/g, ""));
    return sum + numericPrice;
  }, 0);

  const stats = [
    {
      title: "Клиенты",
      value: clients.length,
    },
    {
      title: "Активные заказы",
      value: activeOrders.length,
    },
    {
      title: "Готово",
      value: completedOrders.length,
    },
    {
      title: "Просрочено",
      value: overdueOrders.length,
    },
    {
      title: "Примерки",
      value: plannedFittings.length,
    },
    {
      title: "Выручка",
      value: `${totalRevenue} €`,
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item) => (
        <div className="stat-card" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
}