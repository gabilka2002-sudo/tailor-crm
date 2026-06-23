import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useCrm } from "../context/CrmContext";

export default function Orders({ setPage }) {
  // Берем данные и функции из общего CRM-хранилища
  const {
    orders,
    clients,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
  } = useCrm();

  // Показывать или скрывать форму создания заказа
  const [showForm, setShowForm] = useState(false);

  // Показывать или скрывать форму редактирования заказа
  const [isEditing, setIsEditing] = useState(false);

  // Текст поиска по заказам
  const [search, setSearch] = useState("");

  // id заказа, который пользователь открыл кликом
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Данные формы редактирования заказа
  const [editForm, setEditForm] = useState({
    client: "",
    product: "",
    price: "",
    status: "В работе",
    deadline: "",
    comment: "",
  });

  // Находим открытый заказ по id.
  // Так карточка будет обновляться после изменения статуса или редактирования.
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  // Фильтруем заказы по номеру, клиенту, изделию или статусу
  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    return (
      order.id.toLowerCase().includes(searchText) ||
      order.client.toLowerCase().includes(searchText) ||
      order.product.toLowerCase().includes(searchText) ||
      order.status.toLowerCase().includes(searchText)
    );
  });

  function handleAddOrder(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newOrder = {
      client: formData.get("client"),
      product: formData.get("product"),
      price: formData.get("price"),
      status: formData.get("status"),
      deadline: formData.get("deadline"),
      comment: formData.get("comment"),
    };

    addOrder(newOrder);
    setShowForm(false);
  }

  function handleDeleteOrder(orderId) {
    const isConfirmed = window.confirm("Удалить этот заказ?");

    if (!isConfirmed) return;

    deleteOrder(orderId);
    setSelectedOrderId(null);
    setIsEditing(false);
  }

  function handleChangeStatus(orderId, newStatus) {
    // Меняем статус в общем CRM-хранилище
    updateOrderStatus(orderId, newStatus);
  }

  function handleStartEdit(order) {
    // Открываем режим редактирования
    setIsEditing(true);

    // Заполняем форму текущими данными заказа
    setEditForm({
      client: order.client,
      product: order.product,
      price: String(order.price).replace(/[^\d]/g, ""),
      status: order.status,
      deadline: order.deadline,
      comment: order.comment || "",
    });
  }

  function handleEditInputChange(event) {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSaveEditedOrder(event) {
    event.preventDefault();

    if (!selectedOrder) return;

    // Сохраняем обновленный заказ в общем CRM-хранилище
    updateOrder(selectedOrder.id, editForm);

    // Закрываем режим редактирования
    setIsEditing(false);
  }

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
                  <select name="client" required>
                    <option value="">Выберите клиента</option>

                    {clients.map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
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

                <label>
                  Комментарий к заказу
                  <textarea
                    name="comment"
                    placeholder="Например: укоротить рукава, добавить подкладку..."
                  />
                </label>

                <button type="submit" className="new-order-button">
                  Создать заказ
                </button>
              </form>
            </div>
          </div>
        )}

        <input
          className="client-search"
          placeholder="Поиск заказа..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

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
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setIsEditing(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
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
                  <td>
                    <button
                      className="delete-client-button"
                      onClick={(event) => {
                        // Чтобы кнопка удаления не открывала карточку заказа
                        event.stopPropagation();
                        handleDeleteOrder(order.id);
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <p style={{ padding: "24px", color: "#777" }}>Заказы не найдены</p>
          )}
        </div>

        {selectedOrder && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Заказ {selectedOrder.id}</h2>
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setIsEditing(false);
                  }}
                >
                  ×
                </button>
              </div>

              {!isEditing ? (
                <div className="client-details">
                  <p>
                    <strong>Клиент:</strong> {selectedOrder.client}
                  </p>

                  <p>
                    <strong>Изделие:</strong> {selectedOrder.product}
                  </p>

                  <p>
                    <strong>Стоимость:</strong> {selectedOrder.price}
                  </p>

                  <p>
                    <strong>Статус:</strong>{" "}
                    <span className={`status ${selectedOrder.statusClass}`}>
                      {selectedOrder.status}
                    </span>
                  </p>

                  <p>
                    <strong>Срок:</strong> {selectedOrder.deadline}
                  </p>

                  {selectedOrder.comment && (
                    <p>
                      <strong>Комментарий:</strong> {selectedOrder.comment}
                    </p>
                  )}

                  <h3>Изменить статус</h3>

                  <div className="measurements-grid">
                    <button
                      className="new-order-button"
                      onClick={() =>
                        handleChangeStatus(selectedOrder.id, "В работе")
                      }
                    >
                      В работе
                    </button>

                    <button
                      className="new-order-button"
                      onClick={() =>
                        handleChangeStatus(selectedOrder.id, "Примерка")
                      }
                    >
                      Примерка
                    </button>

                    <button
                      className="new-order-button"
                      onClick={() =>
                        handleChangeStatus(selectedOrder.id, "Готово")
                      }
                    >
                      Готово
                    </button>
                  </div>

                  <button
                    className="new-order-button"
                    onClick={() => handleStartEdit(selectedOrder)}
                  >
                    Редактировать заказ
                  </button>

                  <button
                    className="delete-client-button"
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                  >
                    Удалить заказ
                  </button>
                </div>
              ) : (
                <form className="client-form" onSubmit={handleSaveEditedOrder}>
                  <label>
                    Клиент
                    <select
                      name="client"
                      value={editForm.client}
                      onChange={handleEditInputChange}
                      required
                    >
                      {clients.map((client) => (
                        <option key={client.id} value={client.name}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Изделие
                    <input
                      name="product"
                      value={editForm.product}
                      onChange={handleEditInputChange}
                      required
                    />
                  </label>

                  <label>
                    Стоимость
                    <input
                      name="price"
                      value={editForm.price}
                      onChange={handleEditInputChange}
                      required
                    />
                  </label>

                  <label>
                    Статус
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option>В работе</option>
                      <option>Примерка</option>
                      <option>Готово</option>
                    </select>
                  </label>

                  <label>
                    Срок
                    <input
                      name="deadline"
                      value={editForm.deadline}
                      onChange={handleEditInputChange}
                      required
                    />
                  </label>

                  <label>
                    Комментарий
                    <textarea
                      name="comment"
                      value={editForm.comment}
                      onChange={handleEditInputChange}
                    />
                  </label>

                  <button type="submit" className="new-order-button">
                    Сохранить изменения
                  </button>

                  <button
                    type="button"
                    className="delete-client-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Отмена
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}