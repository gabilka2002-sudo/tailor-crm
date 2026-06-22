export default function OrdersTable() {
  const orders = [
    {
      id: "#001",
      client: "Иванов И.И.",
      item: "Пиджак",
      status: "В работе",
      statusClass: "blue",
    },
    {
      id: "#002",
      client: "Петрова А.А.",
      item: "Платье",
      status: "Примерка",
      statusClass: "purple",
    },
    {
      id: "#003",
      client: "Смирнова Д.А.",
      item: "Брюки",
      status: "Готово",
      statusClass: "green",
    },
  ];

  return (
    <div className="orders-card">
      <h2>Последние заказы</h2>

      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Клиент</th>
            <th>Изделие</th>
            <th>Статус</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.client}</td>
              <td>{order.item}</td>
              <td>
                <span className={`status ${order.statusClass}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}