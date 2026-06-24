import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { useCrm } from "../context/CrmContext";
import EmptyState from "../components/EmptyState";

const emptyClientForm = {
  name: "",
  phone: "",
  email: "",
  comment: "",
};

const emptyMeasurements = {
  shoulders: "",
  chest: "",
  waist: "",
  hips: "",
  sleeve: "",
  length: "",
  neck: "",
  height: "",
};

const measurementLabels = {
  shoulders: "Плечи",
  chest: "Грудь",
  waist: "Талия",
  hips: "Бёдра",
  sleeve: "Рукав",
  length: "Длина изделия",
  neck: "Шея",
  height: "Рост",
};

export default function Clients({ setPage }) {
  // Забираем клиентов, заказы, примерки и функции из общего CRM-хранилища
  const {
    clients,
    orders,
    fittings,
    addClient,
    updateClient,
    deleteClient,
    updateClientMeasurements,
  } = useCrm();

  // Показывать или скрывать модальное окно добавления клиента
  const [showForm, setShowForm] = useState(false);

  // Показывать или скрывать режим редактирования клиента
  const [isEditing, setIsEditing] = useState(false);

  // Текст поиска клиента
  const [search, setSearch] = useState("");

  // Сортировка списка клиентов
  const [sortBy, setSortBy] = useState("nameAsc");

  // id клиента, карточку которого открыли
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Черновик формы нового клиента.
  // Важно: он не очищается при закрытии модального окна.
  const [clientForm, setClientForm] = useState(emptyClientForm);

  // Временные значения формы замеров
  const [measurementForm, setMeasurementForm] = useState(emptyMeasurements);

  // Временные значения формы редактирования клиента
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    comment: "",
    oldName: "",
  });

  // Находим открытого клиента по id.
  // Так данные в карточке будут обновляться после сохранения.
  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );

  // Здесь одновременно работают поиск и сортировка клиентов
  const filteredClients = clients
    .filter((client) => {
      const searchText = search.toLowerCase();

      return (
        client.name.toLowerCase().includes(searchText) ||
        client.phone.toLowerCase().includes(searchText) ||
        client.email.toLowerCase().includes(searchText)
      );
    })
    .sort((firstClient, secondClient) => {
      if (sortBy === "nameAsc") {
        return firstClient.name.localeCompare(secondClient.name, "ru");
      }

      if (sortBy === "nameDesc") {
        return secondClient.name.localeCompare(firstClient.name, "ru");
      }

      if (sortBy === "ordersDesc") {
        return Number(secondClient.orders || 0) - Number(firstClient.orders || 0);
      }

      if (sortBy === "ordersAsc") {
        return Number(firstClient.orders || 0) - Number(secondClient.orders || 0);
      }

      if (sortBy === "newest") {
        return Number(secondClient.id || 0) - Number(firstClient.id || 0);
      }

      if (sortBy === "oldest") {
        return Number(firstClient.id || 0) - Number(secondClient.id || 0);
      }

      return 0;
    });

  function handleClientFormChange(event) {
    const { name, value } = event.target;

    setClientForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleClearClientForm() {
    setClientForm(emptyClientForm);
  }

  function handleOpenClient(client) {
    setSelectedClientId(client.id);
    setIsEditing(false);

    // Если у старого клиента ещё нет measurements, подставляем пустые поля
    setMeasurementForm({
      ...emptyMeasurements,
      ...(client.measurements || {}),
    });
  }

  function handleAddClient(event) {
    event.preventDefault();

    const trimmedClient = {
      name: clientForm.name.trim(),
      phone: clientForm.phone.trim(),
      email: clientForm.email.trim(),
      comment: clientForm.comment.trim(),
    };

    // Простая проверка, чтобы не создать пустого клиента
    if (!trimmedClient.name || !trimmedClient.phone || !trimmedClient.email) {
      alert("Заполни имя, телефон и email клиента");
      return;
    }

    addClient(trimmedClient);

    // После успешного сохранения очищаем черновик формы
    setClientForm(emptyClientForm);

    // Закрываем окно
    setShowForm(false);
  }

  function handleDeleteClient(clientId) {
    if (!selectedClient) return;

    // Проверяем, есть ли у клиента связанные заказы
    const clientOrders = orders.filter(
      (order) => order.client === selectedClient.name
    );

    // Проверяем, есть ли у клиента связанные примерки
    const clientFittings = fittings.filter(
      (fitting) => fitting.client === selectedClient.name
    );

    // Если есть история, клиента лучше не удалять.
    // Так мы не получим "висячие" заказы без клиента.
    if (clientOrders.length > 0 || clientFittings.length > 0) {
      alert(
        `Нельзя удалить клиента "${selectedClient.name}", потому что у него есть связанные заказы или примерки.\n\n` +
          `Заказы: ${clientOrders.length}\n` +
          `Примерки: ${clientFittings.length}\n\n` +
          "Сначала обработай или удали связанные данные."
      );

      return;
    }

    const isConfirmed = window.confirm("Удалить этого клиента?");

    if (!isConfirmed) return;

    deleteClient(clientId);
    setSelectedClientId(null);
    setIsEditing(false);
  }

  function handleMeasurementChange(event) {
    const { name, value } = event.target;

    setMeasurementForm((currentMeasurements) => ({
      ...currentMeasurements,
      [name]: value,
    }));
  }

  function handleSaveMeasurements() {
    if (!selectedClient) return;

    // Сохраняем замеры клиента в общем CRM-хранилище
    updateClientMeasurements(selectedClient.id, measurementForm);

    alert("Замеры клиента сохранены");
  }

  function handleStartEditClient() {
    if (!selectedClient) return;

    // Включаем режим редактирования клиента
    setIsEditing(true);

    // Заполняем форму текущими данными клиента
    setEditForm({
      name: selectedClient.name,
      phone: selectedClient.phone,
      email: selectedClient.email,
      comment: selectedClient.comment || "",
      oldName: selectedClient.name,
    });
  }

  function handleEditInputChange(event) {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSaveEditedClient(event) {
    event.preventDefault();

    if (!selectedClient) return;

    const trimmedClient = {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      comment: editForm.comment.trim(),
      oldName: editForm.oldName,
    };

    if (!trimmedClient.name || !trimmedClient.phone || !trimmedClient.email) {
      alert("Имя, телефон и email не могут быть пустыми");
      return;
    }

    // Сохраняем обновлённые данные клиента в общем CRM-хранилище
    updateClient(selectedClient.id, trimmedClient);

    // Выключаем режим редактирования
    setIsEditing(false);
  }

  function handleCloseSelectedClient() {
    setSelectedClientId(null);
    setIsEditing(false);
  }

  return (
    <div className="layout">
      <Sidebar activePage="clients" setPage={setPage} />

      <main className="content">
        <Header setPage={setPage} />

        <div className="page-header">
          <div>
            <h1>Клиенты</h1>
            <p>База клиентов ателье</p>
          </div>

          <button className="new-order-button" onClick={() => setShowForm(true)}>
            + Новый клиент
          </button>
        </div>

        {showForm && (
          <Modal title="Новый клиент" onClose={() => setShowForm(false)}>
            <form className="client-form" onSubmit={handleAddClient}>
              <label>
                Имя клиента
                <input
                  name="name"
                  value={clientForm.name}
                  onChange={handleClientFormChange}
                  placeholder="Иванов И.И."
                  required
                />
              </label>

              <label>
                Телефон
                <input
                  name="phone"
                  value={clientForm.phone}
                  onChange={handleClientFormChange}
                  placeholder="+48 500 111 222"
                  required
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={clientForm.email}
                  onChange={handleClientFormChange}
                  placeholder="client@email.com"
                  required
                />
              </label>

              <label>
                Комментарий
                <textarea
                  name="comment"
                  value={clientForm.comment}
                  onChange={handleClientFormChange}
                  placeholder="Предпочтения клиента, детали заказа..."
                />
              </label>

              <button type="submit" className="new-order-button">
                Сохранить клиента
              </button>

              <button
                type="button"
                className="delete-client-button"
                onClick={handleClearClientForm}
              >
                Очистить форму
              </button>
            </form>
          </Modal>
        )}

        <input
          className="client-search"
          placeholder="Поиск клиента..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

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
            <option value="nameAsc">Имя А → Я</option>
            <option value="nameDesc">Имя Я → А</option>
            <option value="ordersDesc">Больше всего заказов</option>
            <option value="ordersAsc">Меньше всего заказов</option>
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>

        <div className="clients-grid">
          {filteredClients.map((client) => (
            <div
              className="client-card"
              key={client.id}
              onClick={() => handleOpenClient(client)}
            >
              <div className="client-avatar">{client.name[0]}</div>

              <h3>{client.name}</h3>
              <p>{client.phone}</p>
              <p>{client.email}</p>
              <span>{client.orders} заказа</span>
            </div>
          ))}

          {filteredClients.length === 0 && (
  <EmptyState
    title={clients.length === 0 ? "Пока нет клиентов" : "Клиенты не найдены"}
    text={
      clients.length === 0
        ? "Добавь первого клиента, чтобы потом создавать заказы и примерки."
        : "Попробуй изменить поисковый запрос или сортировку."
    }
    buttonText="+ Новый клиент"
    onButtonClick={() => setShowForm(true)}
  />
)}
        </div>

        {selectedClient && (
          <Modal title={selectedClient.name} onClose={handleCloseSelectedClient}>
            {!isEditing ? (
              <div className="client-details">
                <p>
                  <strong>Телефон:</strong> {selectedClient.phone}
                </p>

                <p>
                  <strong>Email:</strong> {selectedClient.email}
                </p>

                <p>
                  <strong>Заказы:</strong> {selectedClient.orders}
                </p>

                {selectedClient.comment && (
                  <p>
                    <strong>Комментарий:</strong> {selectedClient.comment}
                  </p>
                )}

                <h3>Замеры клиента</h3>

                <div className="measurements-grid">
                  {Object.entries(measurementLabels).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        name={key}
                        value={measurementForm[key]}
                        onChange={handleMeasurementChange}
                        placeholder="см"
                      />
                    </label>
                  ))}
                </div>

                <button
                  className="new-order-button"
                  onClick={handleSaveMeasurements}
                >
                  Сохранить замеры
                </button>

                <button
                  className="new-order-button"
                  onClick={handleStartEditClient}
                >
                  Редактировать клиента
                </button>

                <button
                  className="delete-client-button"
                  onClick={() => handleDeleteClient(selectedClient.id)}
                >
                  Удалить клиента
                </button>
              </div>
            ) : (
              <form className="client-form" onSubmit={handleSaveEditedClient}>
                <label>
                  Имя клиента
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </label>

                <label>
                  Телефон
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditInputChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
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