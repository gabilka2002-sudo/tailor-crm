import { useCrm } from "../context/CrmContext";

export default function StatsCards() {
  // Берем реальные заказы и клиентов из общего CRM-хранилища
  const { orders, clients } = useCrm();

  // Считаем заказы, которые ещё не завершены
  const activeOrders = orders.filter(
    (order) => order.status === "В работе" || order.status === "Примерка"
  );

  // Считаем готовые заказы
  const completedOrders = orders.filter((order) => order.status === "Готово");

  // Считаем общую сумму заказов.
  // У нас price хранится как строка "500 €", поэтому убираем всё кроме цифр.
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
      title: "Готово к выдаче",
      value: completedOrders.length,
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