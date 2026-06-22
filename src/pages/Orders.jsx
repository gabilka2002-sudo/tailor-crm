import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Orders({ setPage }) {
  const [showForm, setShowForm] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: "#001",
      client: "Иванов И.И.",
      product: "Пиджак",
      price: "500 €",
      status: "В работе",
      statusClass: "blue",
      deadline: "20.07.2026",
    },
    {
      id: "#002",
      client: "Петрова А.А.",
      product: "Платье",
      price: "350 €",
      status: "Примерка",
      statusClass: "purple",
      deadline: "25.07.2026",
    },
    {
      id: "#003",
      client: "Смирнова Д.А.",
      product: "Брюки",
      price: "180 €",
      status: "Готово",
      statusClass: "green",
      deadline: "15.07.2026",
    },
  ]);

  const getStatusClass = (status) => {
    if (status === "Готово") return "green";
    if (status === "Примерка") return "purple";
    return "blue";
  };

  const handleAddOrder = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const nextNumber = String(orders.length + 1).padStart(3, "0");

    const newOrder = {
      id: `#${nextNumber}`,
      client: formData.get("client"),
      product: formData.get("product"),
      price: `${formData.get("price")} €`,
      status: formData.get("status"),
      statusClass: getStatusClass(formData.get("status")),
      deadline: formData.get("deadline"),
    };

    setOrders([newOrder, ...orders]);
    setShowForm(false);
  };

  return (
    <div className="layout">
      <Sidebar activePage="orders" setPage={setPage} />

      <main className="content">
        <Header />

        <div className="page-header">
          <div>
            <h1>Заказы</h1>
            <p>Управление заказами ателье</p>
          </div>

          <button className="new-order-button" onClick={() => setShowForm(true)}>
            + Новый заказ
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Новый заказ</h2>
                <button onClick={() => setShowForm(false)}>×</button>
              </div>

              <form className="client-form" onSubmit={handleAddOrder}>
                <label>
                  Клиент
                  <input name="client" placeholder="Иванов И.И." required />
                </label>

                <label>
                  Изделие
                  <input name="product" placeholder="Пиджак" required />
                </label>

                <label>
                  Стоимость
                  <input name="price" placeholder="500" required />
                </label>

                <label>
                  Статус
                  <select name="status" required>
                    <option>В работе</option>
                    <option>Примерка</option>
                    <option>Готово</option>
                  </select>
                </label>

                <label>
                  Срок
                  <input name="deadline" placeholder="20.07.2026" required />
                </label>

                <button type="submit" className="new-order-button">
                  Создать заказ
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="orders-card">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Клиент</th>
                <th>Изделие</th>
                <th>Стоимость</th>
                <th>Статус</th>
                <th>Срок</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.client}</td>
                  <td>{order.product}</td>
                  <td>{order.price}</td>
                  <td>
                    <span className={`status ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}