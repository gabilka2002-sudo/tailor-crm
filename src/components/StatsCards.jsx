import { useCrm } from "../context/CrmContext";

function parseDate(dateString) {
  if (!dateString) return null;

  if (dateString.includes(".")) {
    const [day, month, year] = dateString.split(".");
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(dateString);
}

function parseMoney(value) {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
}

export default function StatsCards() {
  const { orders, clients, fittings } = useCrm();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeOrders = orders.filter(
    (order) => order.status === "В работе" || order.status === "Примерка"
  );

  const completedOrders = orders.filter((order) => order.status === "Готово");

  const overdueOrders = orders.filter((order) => {
    const deadline = parseDate(order.deadline);

    if (!deadline) return false;

    return deadline < today && order.status !== "Готово";
  });

  const plannedFittings = fittings.filter(
    (fitting) => fitting.status === "Запланирована"
  );

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + parseMoney(order.price);
  }, 0);

  const totalPaid = orders.reduce((sum, order) => {
    return sum + parseMoney(order.paidAmount);
  }, 0);

  const totalRemaining = orders.reduce((sum, order) => {
    return sum + parseMoney(order.remainingAmount);
  }, 0);

  const unpaidOrders = orders.filter(
    (order) =>
      order.paymentStatus === "Не оплачено" ||
      order.paymentStatus === "Частично оплачено"
  );

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
      title: "Сумма заказов",
      value: `${totalRevenue} €`,
    },
    {
      title: "Оплачено",
      value: `${totalPaid} €`,
    },
    {
      title: "Остаток",
      value: `${totalRemaining} €`,
    },
    {
      title: "Неоплаченные",
      value: unpaidOrders.length,
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