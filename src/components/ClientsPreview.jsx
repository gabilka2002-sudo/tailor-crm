import { useCrm } from "../context/CrmContext";

export default function ClientsPreview({ setPage }) {
  // Берем реальных клиентов из общего CRM-хранилища
  const { clients } = useCrm();

  // На Dashboard показываем только последних 5 клиентов
  const latestClients = clients.slice(0, 5);

  return (
    <div className="clients-card">
      <div className="card-head">
        <h2>Последние клиенты</h2>

        <button onClick={() => setPage("clients")}>
          Все клиенты →
        </button>
      </div>

      <div className="clients-list">
        {latestClients.map((client) => (
          <div className="client-item" key={client.id}>
            <div className="client-avatar">{client.name[0]}</div>

            <div>
              <strong>{client.name}</strong>
              <p>{client.phone}</p>
            </div>

            <span>{client.orders} заказа</span>
          </div>
        ))}

        {latestClients.length === 0 && (
          <p style={{ padding: "16px", color: "#777" }}>
            Клиентов пока нет
          </p>
        )}
      </div>
    </div>
  );
}