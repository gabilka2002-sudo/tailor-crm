import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useCrm } from "../context/CrmContext";
import { parseCrmDate } from "../utils/dateUtils";

const emptyFittingForm = {
  client: "",
  order: "",
  date: "",
  time: "",
  status: "Запланирована",
  comment: "",
};

export default function Fittings({ setPage }) {
  const {
    fittings,
    clients,
    orders,
    addFitting,
    updateFitting,
    updateFittingStatus,
    deleteFitting,
  } = useCrm();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все");
  const [sortBy, setSortBy] = useState("dateAsc");

  const [selectedFittingId, setSelectedFittingId] = useState(null);

  // Черновик новой примерки не очищается при закрытии окна
  const [fittingForm, setFittingForm] = useState(emptyFittingForm);

  // Данные формы редактирования примерки
  const [editForm, setEditForm] = useState(emptyFittingForm);

  const selectedFitting = fittings.find(
    (fitting) => fitting.id === selectedFittingId
  );

  const statusCounts = {
    Все: fittings.length,
    Запланирована: fittings.filter(
      (fitting) => fitting.status === "Запланирована"
    ).length,
    Прошла: fittings.filter((fitting) => fitting.status === "Прошла").length,
    Отменена: fittings.filter((fitting) => fitting.status === "Отменена")
      .length,
  };

  // Здесь одновременно работают поиск, фильтр и сортировка
  const filteredFittings = fittings
    .filter((fitting) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        fitting.client.toLowerCase().includes(searchText) ||
        fitting.order.toLowerCase().includes(searchText) ||
        fitting.date.toLowerCase().includes(searchText) ||
        fitting.status.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "Все" || fitting.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((firstFitting, secondFitting) => {
      if (sortBy === "dateAsc") {
        const firstDate = parseCrmDate(firstFitting.date);
        const secondDate = parseCrmDate(secondFitting.date);

        const firstTime = firstFitting.time || "00:00";
        const secondTime = secondFitting.time || "00:00";

        return (
          (firstDate?.getTime() || 0) -
            (secondDate?.getTime() || 0) ||
          firstTime.localeCompare(secondTime)
        );
      }

      if (sortBy === "dateDesc") {
        const firstDate = parseCrmDate(firstFitting.date);
        const secondDate = parseCrmDate(secondFitting.date);

        const firstTime = firstFitting.time || "00:00";
        const secondTime = secondFitting.time || "00:00";

        return (
          (secondDate?.getTime() || 0) -
            (firstDate?.getTime() || 0) ||
          secondTime.localeCompare(firstTime)
        );
      }

      if (sortBy === "timeAsc") {
        return String(firstFitting.time || "").localeCompare(
          String(secondFitting.time || "")
        );
      }

      if (sortBy === "timeDesc") {
        return String(secondFitting.time || "").localeCompare(
          String(firstFitting.time || "")
        );
      }

      if (sortBy === "status") {
        return firstFitting.status.localeCompare(secondFitting.status, "ru");
      }

      if (sortBy === "newest") {
        return Number(secondFitting.id || 0) - Number(firstFitting.id || 0);
      }

      if (sortBy === "oldest") {
        return Number(firstFitting.id || 0) - Number(secondFitting.id || 0);
      }

      return 0;
    });

  function handleOpenNewFittingForm() {
    // Для примерки нужен хотя бы один клиент
    if (clients.length === 0) {
      alert("Сначала добавь хотя бы одного клиента");
      setPage("clients");
      return;
    }

    // Для примерки нужен хотя бы один заказ
    if (orders.length === 0) {
      alert("Сначала создай хотя бы один заказ");
      setPage("orders");
      return;
    }

    setShowForm(true);
  }

  function handleFittingFormChange(event) {
    const { name, value } = event.target;

    setFittingForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleClearFittingForm() {
    setFittingForm(emptyFittingForm);
  }

  function handleAddFitting(event) {
    event.preventDefault();

    const newFitting = {
      client: fittingForm.client,
      order: fittingForm.order,
      date: fittingForm.date,
      time: fittingForm.time,
      status: fittingForm.status,
      comment: fittingForm.comment.trim(),
    };

    if (
      !newFitting.client ||
      !newFitting.order ||
      !newFitting.date ||
      !newFitting.time
    ) {
      alert("Выберите клиента, заказ, дату и время примерки");
      return;
    }

    addFitting(newFitting);

    setFittingForm(emptyFittingForm);
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
    updateFittingStatus(fittingId, status);
  }

  function handleStartEdit(fitting) {
    setIsEditing(true);

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

    if (
      !editForm.client ||
      !editForm.order ||
      !editForm.date ||
      !editForm.time
    ) {
      alert("Выберите клиента, заказ, дату и время примерки");
      return;
    }

    updateFitting(selectedFitting.id, {
      ...editForm,
      comment: editForm.comment.trim(),
    });

    setIsEditing(false);
  }

  function handleCloseSelectedFitting() {
    setSelectedFittingId(null);
    setIsEditing(false);
  }

  function escapeCsvValue(value) {
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

    // Экспортируем именно то, что сейчас видно в таблице
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
        <Header setPage={setPage} />

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
              onClick={handleOpenNewFittingForm}
            >
              + Новая примерка
            </button>
          </div>
        </div>

        {showForm && (
          <Modal title="Новая примерка" onClose={() => setShowForm(false)}>
            <form className="client-form" onSubmit={handleAddFitting}>
              <label>
                Клиент
                <select
                  name="client"
                  value={fittingForm.client}
                  onChange={handleFittingFormChange}
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
                Заказ
                <select
                  name="order"
                  value={fittingForm.order}
                  onChange={handleFittingFormChange}
                  required
                >
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
                <input
                  name="date"
                  type="date"
                  value={fittingForm.date}
                  onChange={handleFittingFormChange}
                  required
                />
              </label>

              <label>
                Время
                <input
                  name="time"
                  type="time"
                  value={fittingForm.time}
                  onChange={handleFittingFormChange}
                  required
                />
              </label>

              <label>
                Статус
                <select
                  name="status"
                  value={fittingForm.status}
                  onChange={handleFittingFormChange}
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
                  value={fittingForm.comment}
                  onChange={handleFittingFormChange}
                  placeholder="Например: проверить длину рукавов..."
                />
              </label>

              <button type="submit" className="new-order-button">
                Сохранить примерку
              </button>

              <button
                type="button"
                className="delete-client-button"
                onClick={handleClearFittingForm}
              >
                Очистить форму
              </button>
            </form>
          </Modal>
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
            <option value="dateAsc">Сначала ближайшие</option>
            <option value="dateDesc">Сначала дальние</option>
            <option value="timeAsc">По времени ↑</option>
            <option value="timeDesc">По времени ↓</option>
            <option value="status">По статусу</option>
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>

        <div className="orders-card">
          {filteredFittings.length > 0 ? (
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
          ) : (
            <EmptyState
              title={
                fittings.length === 0 ? "Пока нет примерок" : "Примерки не найдены"
              }
              text={
                fittings.length === 0
                  ? "Создай первую примерку, когда у клиента уже есть заказ."
                  : "Попробуй изменить поиск, фильтр или сортировку."
              }
              buttonText="+ Новая примерка"
              onButtonClick={handleOpenNewFittingForm}
            />
          )}
        </div>

        {selectedFitting && (
          <Modal title="Примерка" onClose={handleCloseSelectedFitting}>
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
                      handleChangeFittingStatus(selectedFitting.id, "Отменена")
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
          </Modal>
        )}
      </main>
    </div>
  );
}