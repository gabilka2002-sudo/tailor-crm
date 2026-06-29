import { useCrm } from "../context/CrmContext";

export default function OrdersTable() {
  const { orders } = useCrm();

  const latestOrders = orders.slice(0, 5);

  return (
    <div className="orders-card">
      <h2>Последние заказы</h2>

      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Клиент</th>
              <th>Изделие</th>
              <th>Цена</th>
              <th>Оплачено</th>
              <th>Остаток</th>
              <th>Оплата</th>
              <th>Статус</th>
            </tr>
          </thead>

          <tbody>
            {latestOrders.map((order) => (
              <tr key={order.backendId || order.id}>
                <td>{order.id}</td>
                <td>{order.client}</td>
                <td>{order.product}</td>
                <td>{order.price}</td>
                <td>{order.paidAmount}</td>
                <td>{order.remainingAmount}</td>

                <td>
                  <span className={`status ${order.paymentStatusClass}`}>
                    {order.paymentStatus}
                  </span>
                </td>

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

      {latestOrders.length === 0 && (
        <p style={{ padding: "20px", color: "#777" }}>Заказов пока нет</p>
      )}
    </div>
  );
}