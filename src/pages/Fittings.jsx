import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useCrm } from "../context/CrmContext";

export default function Fittings({ setPage }) {
  // Берем примерки, клиентов, заказы и функции из общего CRM-хранилища
  const {
    fittings,
    clients,
    orders,
    addFitting,
    updateFitting,
    updateFittingStatus,
    deleteFitting,
  } = useCrm();

  // Показывать или скрывать форму создания примерки
  const [showForm, setShowForm] = useState(false);

  // Показывать или скрывать режим редактирования примерки
  const [isEditing, setIsEditing] = useState(false);

  // Текст поиска по примеркам
  const [search, setSearch] = useState("");

  // Активный фильтр по статусу примерки
  const [statusFilter, setStatusFilter] = useState("Все");

  // id примерки, которую пользователь открыл кликом
  const [selectedFittingId, setSelectedFittingId] = useState(null);

  // Данные формы редактирования примерки
  const [editForm, setEditForm] = useState({
    client: "",
    order: "",
    date: "",
    time: "",
    status: "Запланирована",
    comment: "",
  });

  // Находим открытую примерку по id
  const selectedFitting = fittings.find(
    (fitting) => fitting.id === selectedFittingId
  );

  // Считаем количество примерок по статусам для кнопок фильтра
  const statusCounts = {
    Все: fittings.length,
    Запланирована: fittings.filter(
      (fitting) => fitting.status === "Запланирована"
    ).length,
    Прошла: fittings.filter((fitting) => fitting.status === "Прошла").length,
    Отменена: fittings.filter((fitting) => fitting.status === "Отменена").length,
  };

  // Фильтруем примерки по поиску и выбранному статусу
  const filteredFittings = fittings.filter((fitting) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      fitting.client.toLowerCase().includes(searchText) ||
      fitting.order.toLowerCase().includes(searchText) ||
      fitting.date.toLowerCase().includes(searchText) ||
      fitting.status.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "Все" || fitting.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function handleAddFitting(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newFitting = {
      client: formData.get("client"),
      order: formData.get("order"),
      date: formData.get("date"),
      time: formData.get("time"),
      status: formData.get("status"),
      comment: formData.get("comment"),
    };

    addFitting(newFitting);
    setShowForm(false);
  }

  function handleDeleteFitting(fittingId) {
    const isConfirmed = window.confirm("Удалить эту примерку?");

    if (!isConfirmed) return;

    deleteFitting(fittingId);
    setSelectedFittingId(null);
    setIsEditing(false);
  }

  function handleChangeFittingStatus(fittingId, status) {
    // Меняем статус в общем CRM-хранилище
    updateFittingStatus(fittingId, status);
  }

  function handleStartEdit(fitting) {
    // Включаем режим редактирования
    setIsEditing(true);

    // Заполняем форму текущими данными примерки
    setEditForm({
      client: fitting.client,
      order: fitting.order,
      date: fitting.date,
      time: fitting.time,
      status: fitting.status,
      comment: fitting.comment || "",
    });
  }

  function handleEditInputChange(event) {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSaveEditedFitting(event) {
    event.preventDefault();

    if (!selectedFitting) return;

    // Сохраняем обновленную примерку в общем CRM-хранилище
    updateFitting(selectedFitting.id, editForm);

    // Закрываем режим редактирования
    setIsEditing(false);
  }

  function escapeCsvValue(value) {
    // CSV может сломаться, если внутри значения есть запятая, кавычки или перенос строки.
    // Поэтому такие значения оборачиваем в кавычки.
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

  function handleExportFittingsCsv() {
    const headers = [
      "ID",
      "Клиент",
      "Заказ",
      "Дата",
      "Время",
      "Статус",
      "Комментарий",
    ];

    // Экспортируем именно отфильтрованные примерки
    const rows = filteredFittings.map((fitting) => [
      fitting.id,
      fitting.client,
      fitting.order,
      fitting.date,
      fitting.time,
      fitting.status,
      fitting.comment || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    // BOM нужен для корректной кириллицы в Excel
    const file = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "tailor-crm-fittings.csv";
    link.click();

    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <div className="layout">
      <Sidebar activePage="fittings" setPage={setPage} />

      <main className="content">
        <Header />

        <div className="page-header">
          <div>
            <h1>Примерки</h1>
            <p>Планирование и контроль примерок</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="new-order-button"
              onClick={handleExportFittingsCsv}
            >
              Экспорт CSV
            </button>

            <button
              className="new-order-button"
              onClick={() => setShowForm(true)}
            >
              + Новая примерка
            </button>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Новая примерка</h2>
                <button onClick={() => setShowForm(false)}>×</button>
              </div>

              <form className="client-form" onSubmit={handleAddFitting}>
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
                  Заказ
                  <select name="order" required>
                    <option value="">Выберите заказ</option>

                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.id} — {order.product}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Дата
                  <input name="date" type="date" required />
                </label>

                <label>
                  Время
                  <input name="time" type="time" required />
                </label>

                <label>
                  Статус
                  <select name="status" required>
                    <option>Запланирована</option>
                    <option>Прошла</option>
                    <option>Отменена</option>
                  </select>
                </label>

                <label>
                  Комментарий
                  <textarea
                    name="comment"
                    placeholder="Например: проверить длину рукавов..."
                  />
                </label>

                <button type="submit" className="new-order-button">
                  Сохранить примерку
                </button>
              </form>
            </div>
          </div>
        )}

        <input
          className="client-search"
          placeholder="Поиск примерки..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div
          className="orders-card"
          style={{ marginBottom: "24px", padding: "16px" }}
        >
          <h2>Фильтр по статусу</h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["Все", "Запланирована", "Прошла", "Отменена"].map((status) => (
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

        <div className="orders-card">
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Заказ</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredFittings.map((fitting) => (
                <tr
                  key={fitting.id}
                  onClick={() => {
                    setSelectedFittingId(fitting.id);
                    setIsEditing(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>{fitting.client}</td>
                  <td>{fitting.order}</td>
                  <td>{fitting.date}</td>
                  <td>{fitting.time}</td>
                  <td>{fitting.status}</td>
                  <td>
                    <button
                      className="delete-client-button"
                      onClick={(event) => {
                        // Чтобы кнопка удаления не открывала карточку примерки
                        event.stopPropagation();
                        handleDeleteFitting(fitting.id);
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFittings.length === 0 && (
            <p style={{ padding: "24px", color: "#777" }}>
              Примерки не найдены
            </p>
          )}
        </div>

        {selectedFitting && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Примерка</h2>
                <button
                  onClick={() => {
                    setSelectedFittingId(null);
                    setIsEditing(false);
                  }}
                >
                  ×
                </button>
              </div>

              {!isEditing ? (
                <div className="client-details">
                  <p>
                    <strong>Клиент:</strong> {selectedFitting.client}
                  </p>

                  <p>
                    <strong>Заказ:</strong> {selectedFitting.order}
                  </p>

                  <p>
                    <strong>Дата:</strong> {selectedFitting.date}
                  </p>

                  <p>
                    <strong>Время:</strong> {selectedFitting.time}
                  </p>

                  <p>
                    <strong>Статус:</strong> {selectedFitting.status}
                  </p>

                  {selectedFitting.comment && (
                    <p>
                      <strong>Комментарий:</strong> {selectedFitting.comment}
                    </p>
                  )}

                  <h3>Изменить статус</h3>

                  <div className="measurements-grid">
                    <button
                      className="new-order-button"
                      onClick={() =>
                        handleChangeFittingStatus(
                          selectedFitting.id,
                          "Запланирована"
                        )
                      }
                    >
                      Запланирована
                    </button>

                    <button
                      className="new-order-button"
                      onClick={() =>
                        handleChangeFittingStatus(selectedFitting.id, "Прошла")
                      }
                    >
                      Прошла
                    </button>

                    <button
                      className="new-order-button"
                      onClick={() =>
                        handleChangeFittingStatus(
                          selectedFitting.id,
                          "Отменена"
                        )
                      }
                    >
                      Отменена
                    </button>
                  </div>

                  <button
                    className="new-order-button"
                    onClick={() => handleStartEdit(selectedFitting)}
                  >
                    Редактировать примерку
                  </button>

                  <button
                    className="delete-client-button"
                    onClick={() => handleDeleteFitting(selectedFitting.id)}
                  >
                    Удалить примерку
                  </button>
                </div>
              ) : (
                <form className="client-form" onSubmit={handleSaveEditedFitting}>
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
                    Заказ
                    <select
                      name="order"
                      value={editForm.order}
                      onChange={handleEditInputChange}
                      required
                    >
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.id} — {order.product}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Дата
                    <input
                      name="date"
                      type="date"
                      value={editForm.date}
                      onChange={handleEditInputChange}
                      required
                    />
                  </label>

                  <label>
                    Время
                    <input
                      name="time"
                      type="time"
                      value={editForm.time}
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
                      <option>Запланирована</option>
                      <option>Прошла</option>
                      <option>Отменена</option>
                    </select>
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