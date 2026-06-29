// Возвращает CSS-класс для статуса заказа.
// Эти классы уже используются во frontend.
export function getOrderStatusClass(status) {
  if (status === "Готово") {
    return "green";
  }

  if (status === "Примерка") {
    return "purple";
  }

  return "blue";
}

// Возвращает CSS-класс для статуса примерки.
export function getFittingStatusClass(status) {
  if (status === "Прошла") {
    return "green";
  }

  if (status === "Отменена") {
    return "purple";
  }

  return "blue";
}

// Возвращает CSS-класс для статуса оплаты.
export function getPaymentStatusClass(status) {
  if (status === "Оплачено") {
    return "green";
  }

  if (status === "Частично оплачено") {
    return "purple";
  }

  return "blue";
}

// Превращает дату backend-формата в формат для интерфейса.
// Backend отдаёт: 2026-07-20T00:00:00.000Z
// Frontend показывает: 20.07.2026
export function formatDateForUi(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ru-RU");
}

// Превращает дату из формы в формат для backend.
// Frontend может дать: 20.07.2026 или 2026-07-20
// Backend лучше отправлять: 2026-07-20
export function formatDateForApi(dateValue) {
  const value = String(dateValue || "").trim();

  if (!value) return "";

  // Если уже формат 2026-07-20, возвращаем как есть
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Если формат 20.07.2026, превращаем в 2026-07-20
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [day, month, year] = value.split(".");

    return `${year}-${month}-${day}`;
  }

  return value;
}

// Превращает значение "850 €" или "850" в число 850
export function parseMoneyValue(value) {
  return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
}

// Адаптирует клиента из backend под формат, который сейчас ждёт frontend
export function adaptClientFromApi(client) {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    comment: client.comment || "",
    orders: client.ordersCount || client.orders?.length || 0,
    measurements: client.measurements || {},
  };
}

// Адаптирует заказ из backend под текущий frontend
export function adaptOrderFromApi(order) {
  const price = Number(order.price || 0);
  const paidAmount = Number(order.paidAmount || 0);
  const remainingAmount = Math.max(price - paidAmount, 0);

  return {
    id: order.orderNumber,
    backendId: order.id,
    clientId: order.clientId,
    client: order.client?.name || "",
    product: order.product,

    price: `${price} €`,
    paidAmount: `${paidAmount} €`,
    remainingAmount: `${remainingAmount} €`,
    paymentStatus: order.paymentStatus || "Не оплачено",
    paymentStatusClass: getPaymentStatusClass(
      order.paymentStatus || "Не оплачено"
    ),

    status: order.status,
    statusClass: getOrderStatusClass(order.status),
    deadline: formatDateForUi(order.deadline),
    comment: order.comment || "",
  };
}

// Адаптирует примерку из backend под текущий frontend
export function adaptFittingFromApi(fitting) {
  return {
    id: fitting.id,
    backendId: fitting.id,
    clientId: fitting.clientId,
    orderId: fitting.orderId,
    client: fitting.client?.name || "",
    order: fitting.order?.orderNumber || "",
    date: formatDateForUi(fitting.date),
    time: fitting.time,
    status: fitting.status,
    statusClass: getFittingStatusClass(fitting.status),
    comment: fitting.comment || "",
  };
}

// Подготавливает клиента из frontend-формы для backend
export function adaptClientToApi(clientData) {
  return {
    name: clientData.name,
    phone: clientData.phone,
    email: clientData.email,
    comment: clientData.comment || "",
    measurements: clientData.measurements || null,
  };
}

// Подготавливает заказ из frontend-формы для backend
export function adaptOrderToApi(orderData, clients) {
  const client = clients.find((item) => item.name === orderData.client);

  return {
    clientId: orderData.clientId || client?.id,
    product: orderData.product,
    price: orderData.price,
    paidAmount: orderData.paidAmount || 0,
    paymentStatus: orderData.paymentStatus || "",
    status: orderData.status,
    deadline: formatDateForApi(orderData.deadline),
    comment: orderData.comment || "",
  };
}

// Подготавливает примерку из frontend-формы для backend
export function adaptFittingToApi(fittingData, clients, orders) {
  const client = clients.find((item) => item.name === fittingData.client);
  const order = orders.find((item) => item.id === fittingData.order);

  return {
    clientId: fittingData.clientId || client?.id,
    orderId: fittingData.orderId || order?.backendId,
    date: formatDateForApi(fittingData.date),
    time: fittingData.time,
    status: fittingData.status,
    comment: fittingData.comment || "",
  };
}