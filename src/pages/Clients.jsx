import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Clients({ setPage }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  const [clients, setClients] = useState([
    { id: 1, name: "Иванов И.И.", phone: "+48 500 111 222", email: "ivan@email.com", orders: 3 },
    { id: 2, name: "Петрова А.А.", phone: "+48 600 222 333", email: "anna@email.com", orders: 1 },
    { id: 3, name: "Смирнова Д.А.", phone: "+48 700 333 444", email: "daria@email.com", orders: 2 },
  ]);

  const handleAddClient = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const newClient = {
      id: Date.now(),
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      orders: 0,
    };

    setClients([newClient, ...clients]);
    setShowForm(false);
  };

  const handleDeleteClient = (clientId) => {
    setClients(clients.filter((client) => client.id !== clientId));
    setSelectedClient(null);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
  );

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
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="clients-grid">
          {filteredClients.map((client) => (
            <div
              className="client-card"
              key={client.id}
              onClick={() => setSelectedClient(client)}
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
                <button onClick={() => setSelectedClient(null)}>×</button>
              </div>

              <div className="client-details">
                <p><strong>Телефон:</strong> {selectedClient.phone}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Заказы:</strong> {selectedClient.orders}</p>

                <h3>Замеры</h3>

                <div className="measurements-grid">
                  <span>Плечи: 48 см</span>
                  <span>Грудь: 102 см</span>
                  <span>Талия: 88 см</span>
                  <span>Рукав: 64 см</span>
                </div>

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