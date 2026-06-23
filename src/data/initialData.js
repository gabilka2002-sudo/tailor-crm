export const initialClients = [
  {
    id: 1,
    name: "Иванов И.И.",
    phone: "+48 500 111 222",
    email: "ivan@email.com",
    orders: 3,
    comment: "Постоянный клиент. Предпочитает классический стиль.",
  },
  {
    id: 2,
    name: "Петрова А.А.",
    phone: "+48 600 222 333",
    email: "anna@email.com",
    orders: 1,
    comment: "Нужны напоминания перед примеркой.",
  },
  {
    id: 3,
    name: "Смирнова Д.А.",
    phone: "+48 700 333 444",
    email: "daria@email.com",
    orders: 2,
    comment: "Часто заказывает брюки и жакеты.",
  },
];

export const initialOrders = [
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
];
export const initialFittings = [
  {
    id: 1,
    client: "Иванов И.И.",
    order: "#001",
    date: "25.07.2026",
    time: "12:00",
    status: "Запланирована",
  },
];