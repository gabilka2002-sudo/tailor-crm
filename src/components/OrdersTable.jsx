import { useCrm } from "../context/CrmContext";

export default function OrdersTable() {
  // Берем реальные заказы из общего CRM-хранилища
  const { orders } = useCrm();

  // На Dashboard показываем только последние 5 заказов
  const latestOrders = orders.slice(0, 5);

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
          {latestOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.client}</td>
              <td>{order.product}</td>
              <td>
                <span className={`status ${order.statusClass}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {latestOrders.length === 0 && (
        <p style={{ padding: "20px", color: "#777" }}>
          Заказов пока нет
        </p>
      )}
    </div>
  );
}