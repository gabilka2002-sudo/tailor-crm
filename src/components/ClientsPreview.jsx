export default function ClientsPreview() {
  const clients = [
    {
      name: "Иванов И.И.",
      phone: "+48 500 111 222",
      orders: "3 заказа",
    },
    {
      name: "Петрова А.А.",
      phone: "+48 600 222 333",
      orders: "1 заказ",
    },
    {
      name: "Смирнова Д.А.",
      phone: "+48 700 333 444",
      orders: "2 заказа",
    },
  ];

  return (
    <div className="clients-card">
      <div className="card-head">
        <h2>Последние клиенты</h2>
        <button>Все клиенты →</button>
      </div>

      <div className="clients-list">
        {clients.map((client) => (
          <div className="client-item" key={client.phone}>
            <div className="client-avatar">{client.name[0]}</div>

            <div>
              <strong>{client.name}</strong>
              <p>{client.phone}</p>
            </div>

            <span>{client.orders}</span>
          </div>
        ))}
      </div>
    </div>
  );
}