const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Универсальная функция для запросов к backend.
// Она помогает не повторять fetch / headers / JSON в каждом методе.
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка запроса к серверу");
  }

  return data;
}

/* =========================
   CLIENTS API
========================= */

export function getClients() {
  return request("/clients");
}

export function getClientById(clientId) {
  return request(`/clients/${clientId}`);
}

export function createClient(clientData) {
  return request("/clients", {
    method: "POST",
    body: JSON.stringify(clientData),
  });
}

export function updateClient(clientId, clientData) {
  return request(`/clients/${clientId}`, {
    method: "PUT",
    body: JSON.stringify(clientData),
  });
}

export function deleteClient(clientId) {
  return request(`/clients/${clientId}`, {
    method: "DELETE",
  });
}

/* =========================
   ORDERS API
========================= */

export function getOrders() {
  return request("/orders");
}

export function getOrderById(orderId) {
  return request(`/orders/${orderId}`);
}

export function createOrder(orderData) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export function updateOrder(orderId, orderData) {
  return request(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
}

export function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateOrderPayment(orderId, paymentData) {
  return request(`/orders/${orderId}/payment`, {
    method: "PATCH",
    body: JSON.stringify(paymentData),
  });
}

export function deleteOrder(orderId) {
  return request(`/orders/${orderId}`, {
    method: "DELETE",
  });
}

/* =========================
   FITTINGS API
========================= */

export function getFittings() {
  return request("/fittings");
}

export function getFittingById(fittingId) {
  return request(`/fittings/${fittingId}`);
}

export function createFitting(fittingData) {
  return request("/fittings", {
    method: "POST",
    body: JSON.stringify(fittingData),
  });
}

export function updateFitting(fittingId, fittingData) {
  return request(`/fittings/${fittingId}`, {
    method: "PUT",
    body: JSON.stringify(fittingData),
  });
}

export function updateFittingStatus(fittingId, status) {
  return request(`/fittings/${fittingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteFitting(fittingId) {
  return request(`/fittings/${fittingId}`, {
    method: "DELETE",
  });
}