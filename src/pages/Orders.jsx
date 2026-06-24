import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useCrm } from "../context/CrmContext";
import { normalizePrice, validateOrderData } from "../utils/validators";
import { parseCrmDate, parsePrice } from "../utils/dateUtils";

const emptyOrderForm = {
  client: "",
  product: "",
  price: "",
  status: "В работе",
  deadline: "",
  comment: "",
};

export default function Orders({ setPage }) {
  const {
    orders,
    clients,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
  } = useCrm();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все");
  const [sortBy, setSortBy] = useState("deadlineAsc");

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Черновик нового заказа не очищается при закрытии окна
  const [orderForm, setOrderForm] = useState(emptyOrderForm);

  // Данные формы редактирования заказа
  const [editForm, setEditForm] = useState(emptyOrderForm);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const statusCounts = {
    Все: orders.length,
    "В работе": orders.filter((order) => order.status === "В работе").length,
    Примерка: orders.filter((order) => order.status === "Примерка").length,
    Готово: orders.filter((order) => order.status === "Готово").length,
  };

  // Здесь одновременно работают поиск, фильтр и сортировка
  const filteredOrders = orders
    .filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        order.id.toLowerCase().includes(searchText) ||
        order.client.toLowerCase().includes(searchText) ||
        order.product.toLowerCase().includes(searchText) ||
        order.status.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "Все" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((firstOrder, secondOrder) => {
      if (sortBy === "deadlineAsc") {
        const firstDate = parseCrmDate(firstOrder.deadline);
        const secondDate = parseCrmDate(secondOrder.deadline);

        return (firstDate?.getTime() || 0) - (secondDate?.getTime() || 0);
      }

      if (sortBy === "deadlineDesc") {
        const firstDate = parseCrmDate(firstOrder.deadline);
        const secondDate = parseCrmDate(secondOrder.deadline);

        return (secondDate?.getTime() || 0) - (firstDate?.getTime() || 0);
      }

      if (sortBy === "priceDesc") {
        return parsePrice(secondOrder.price) - parsePrice(firstOrder.price);
      }

      if (sortBy === "priceAsc") {
        return parsePrice(firstOrder.price) - parsePrice(secondOrder.price);
      }

      if (sortBy === "status") {
        return firstOrder.status.localeCompare(secondOrder.status, "ru");
      }

      if (sortBy === "newest") {
        return String(secondOrder.id).localeCompare(String(firstOrder.id));
      }

      if (sortBy === "oldest") {
        return String(firstOrder.id).localeCompare(String(secondOrder.id));
      }

      return 0;
    });

  function handleOpenNewOrderForm() {
    // Нельзя создать заказ без клиента
    if (clients.length === 0) {
      alert("Сначала добавь хотя бы одного клиента");
      setPage("clients");
      return;
    }

    setShowForm(true);
  }

  function handleOrderFormChange(event) {
    const { name, value } = event.target;

    setOrderForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleClearOrderForm() {
    setOrderForm(emptyOrderForm);
  }

  function handleAddOrder(event) {
    event.preventDefault();

    const newOrder = {
      client: orderForm.client,
      product: orderForm.product.trim(),
      price: orderForm.price,
      status: orderForm.status,
      deadline: orderForm.deadline.trim(),
      comment: orderForm.comment.trim(),
    };

    // Проверяем данные перед созданием заказа
    const validationError = validateOrderData(newOrder);

    if (validationError) {
      alert(validationError);
      return;
    }

    // Нормализуем цену: "500" -> "500 €"
    addOrder({
      ...newOrder,
      price: normalizePrice(newOrder.price),
    });

    // После успешного создания очищаем форму
    setOrderForm(emptyOrderForm);
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
    updateOrderStatus(orderId, newStatus);
  }

  function handleStartEdit(order) {
    setIsEditing(true);

    // Убираем знак €, чтобы в поле редактировалось только число
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

    const validationError = validateOrderData(editForm);

    if (validationError) {
      alert(validationError);
      return;
    }

    updateOrder(selectedOrder.id, {
      ...editForm,
      price: normalizePrice(editForm.price),
    });

    setIsEditing(false);
  }

  function handleCloseSelectedOrder() {
    setSelectedOrderId(null);
    setIsEditing(false);
  }

  function escapeCsvValue(value) {
    // CSV ломается от запятых, кавычек и переносов строк,
    // поэтому такие значения оборачиваем в кавычки
    const stringValue = String(value ?? "");

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replaceAll('"', '""')}"`;
    }

    return stringValue;
  }

  function handleExportOrdersCsv() {
    const headers = [
      "Номер заказа",
      "Клиент",
      "Изделие",
      "Стоимость",
      "Статус",
      "Срок",
      "Комментарий",
    ];

    // Экспортируем именно то, что сейчас видно в таблице
    const rows = filteredOrders.map((order) => [
      order.id,
      order.client,
      order.product,
      order.price,
      order.status,
      order.deadline,
      order.comment || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    // BOM нужен, чтобы Excel нормально открывал кириллицу
    const file = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "tailor-crm-orders.csv";
    link.click();

    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <div className="layout">
      <Sidebar activePage="orders" setPage={setPage} />

      <main className="content">
        <Header setPage={setPage} />

        <div className="page-header">
          <div>
            <h1>Заказы</h1>
            <p>Управление заказами ателье</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="new-order-button"
              onClick={handleExportOrdersCsv}
            >
              Экспорт CSV
            </button>

            <button className="new-order-button" onClick={handleOpenNewOrderForm}>
              + Новый заказ
            </button>
          </div>
        </div>

        {showForm && (
          <Modal title="Новый заказ" onClose={() => setShowForm(false)}>
            <form className="client-form" onSubmit={handleAddOrder}>
              <label>
                Клиент
                <select
                  name="client"
                  value={orderForm.client}
                  onChange={handleOrderFormChange}
                  required
                >
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
                <input
                  name="product"
                  value={orderForm.product}
                  onChange={handleOrderFormChange}
                  placeholder="Пиджак"
                  required
                />
              </label>

              <label>
                Стоимость
                <input
                  name="price"
                  value={orderForm.price}
                  onChange={handleOrderFormChange}
                  placeholder="500"
                  required
                />
              </label>

              <label>
                Статус
                <select
                  name="status"
                  value={orderForm.status}
                  onChange={handleOrderFormChange}
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
                  value={orderForm.deadline}
                  onChange={handleOrderFormChange}
                  placeholder="20.07.2026 или 2026-07-20"
                  required
                />
              </label>

              <label>
                Комментарий к заказу
                <textarea
                  name="comment"
                  value={orderForm.comment}
                  onChange={handleOrderFormChange}
                  placeholder="Например: укоротить рукава, добавить подкладку..."
                />
              </label>

              <button type="submit" className="new-order-button">
                Создать заказ
              </button>

              <button
                type="button"
                className="delete-client-button"
                onClick={handleClearOrderForm}
              >
                Очистить форму
              </button>
            </form>
          </Modal>
        )}

        <input
          className="client-search"
          placeholder="Поиск заказа..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div
          className="orders-card"
          style={{ marginBottom: "24px", padding: "16px" }}
        >
          <h2>Фильтр по статусу</h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Все", "В работе", "Примерка", "Готово"].map((status) => (
              <button
                key={status}
                className={
                  statusFilter === status
                    ? "new-order-button"
                    : "delete-client-button"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        <div
          className="orders-card"
          style={{ marginBottom: "24px", padding: "16px" }}
        >
          <h2>Сортировка</h2>

          <select
            className="client-search"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            style={{ marginBottom: 0 }}
          >
            <option value="deadlineAsc">Сначала ближайший срок</option>
            <option value="deadlineDesc">Сначала дальний срок</option>
            <option value="priceDesc">Сначала дорогие</option>
            <option value="priceAsc">Сначала дешёвые</option>
            <option value="status">По статусу</option>
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>

        <div className="orders-card">
          {filteredOrders.length > 0 ? (
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
          ) : (
            <EmptyState
              title={orders.length === 0 ? "Пока нет заказов" : "Заказы не найдены"}
              text={
                orders.length === 0
                  ? "Создай первый заказ для клиента, чтобы начать вести работу ателье."
                  : "Попробуй изменить поиск, фильтр или сортировку."
              }
              buttonText="+ Новый заказ"
              onButtonClick={handleOpenNewOrderForm}
            />
          )}
        </div>

        {selectedOrder && (
          <Modal
            title={`Заказ ${selectedOrder.id}`}
            onClose={handleCloseSelectedOrder}
          >
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
          </Modal>
        )}
      </main>
    </div>
  );
}