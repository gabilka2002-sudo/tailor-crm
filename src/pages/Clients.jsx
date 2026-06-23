import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useCrm } from "../context/CrmContext";

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
  // Забираем клиентов и функции из общего CRM-хранилища
  const { clients, addClient, deleteClient, updateClientMeasurements } = useCrm();

  // Показывать или скрывать модальное окно добавления клиента
  const [showForm, setShowForm] = useState(false);

  // Текст поиска клиента
  const [search, setSearch] = useState("");

  // id клиента, карточку которого открыли
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Временные значения формы замеров
  const [measurementForm, setMeasurementForm] = useState(emptyMeasurements);

  // Находим открытого клиента по id.
  // Так данные в карточке будут обновляться после сохранения замеров.
  const selectedClient = clients.find((client) => client.id === selectedClientId);

  // Фильтруем клиентов по имени, телефону или email
  const filteredClients = clients.filter((client) => {
    const searchText = search.toLowerCase();

    return (
      client.name.toLowerCase().includes(searchText) ||
      client.phone.toLowerCase().includes(searchText) ||
      client.email.toLowerCase().includes(searchText)
    );
  });

  function handleOpenClient(client) {
    setSelectedClientId(client.id);

    // Если у старого клиента ещё нет measurements, подставляем пустые поля
    setMeasurementForm({
      ...emptyMeasurements,
      ...(client.measurements || {}),
    });
  }

  function handleAddClient(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const newClient = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      comment: formData.get("comment"),
    };

    addClient(newClient);
    setShowForm(false);
  }

  function handleDeleteClient(clientId) {
    const isConfirmed = window.confirm("Удалить этого клиента?");

    if (!isConfirmed) return;

    deleteClient(clientId);
    setSelectedClientId(null);
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

  return (
    <div className="layout">
      <Sidebar activePage="clients" setPage={setPage} />

      <main className="content">
        <Header />

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
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Новый клиент</h2>
                <button onClick={() => setShowForm(false)}>×</button>
              </div>

              <form className="client-form" onSubmit={handleAddClient}>
                <label>
                  Имя клиента
                  <input name="name" placeholder="Иванов И.И." required />
                </label>

                <label>
                  Телефон
                  <input name="phone" placeholder="+48 500 111 222" required />
                </label>

                <label>
                  Email
                  <input name="email" placeholder="client@email.com" required />
                </label>

                <label>
                  Комментарий
                  <textarea
                    name="comment"
                    placeholder="Предпочтения клиента, детали заказа..."
                  />
                </label>

                <button type="submit" className="new-order-button">
                  Сохранить клиента
                </button>
              </form>
            </div>
          </div>
        )}

        <input
          className="client-search"
          placeholder="Поиск клиента..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

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
        </div>

        {selectedClient && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>{selectedClient.name}</h2>
                <button onClick={() => setSelectedClientId(null)}>×</button>
              </div>

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
                  className="delete-client-button"
                  onClick={() => handleDeleteClient(selectedClient.id)}
                >
                  Удалить клиента
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}