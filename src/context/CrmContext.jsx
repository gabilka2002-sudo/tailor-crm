/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  getClients,
  createClient,
  updateClient as updateClientApi,
  deleteClient as deleteClientApi,
  getOrders,
  createOrder,
  updateOrder as updateOrderApi,
  updateOrderStatus as updateOrderStatusApi,
  deleteOrder as deleteOrderApi,
  getFittings,
  createFitting,
  updateFitting as updateFittingApi,
  updateFittingStatus as updateFittingStatusApi,
  deleteFitting as deleteFittingApi,
} from "../api/crmApi";
import {
  adaptClientFromApi,
  adaptClientToApi,
  adaptOrderFromApi,
  adaptOrderToApi,
  adaptFittingFromApi,
  adaptFittingToApi,
} from "../api/adapters";
import { useToast } from "./ToastContext.jsx";
import { LoadingState, ErrorState } from "../components/AppState.jsx";

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const { showToast } = useToast();

  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fittings, setFittings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCrmData();
  }, []);

  async function loadCrmData() {
    try {
      setLoading(true);
      setError("");

      const [clientsFromApi, ordersFromApi, fittingsFromApi] =
        await Promise.all([getClients(), getOrders(), getFittings()]);

      setClients(clientsFromApi.map(adaptClientFromApi));
      setOrders(ordersFromApi.map(adaptOrderFromApi));
      setFittings(fittingsFromApi.map(adaptFittingFromApi));
    } catch (apiError) {
      setError(apiError.message || "Не удалось загрузить данные CRM");
    } finally {
      setLoading(false);
    }
  }

  async function addClient(clientData) {
    try {
      setError("");

      const createdClient = await createClient(adaptClientToApi(clientData));

      setClients((currentClients) => [
        adaptClientFromApi(createdClient),
        ...currentClients,
      ]);

      showToast("Клиент создан", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось создать клиента");
      showToast(apiError.message || "Не удалось создать клиента", "error");
    }
  }

  async function updateClient(clientId, updatedData) {
    try {
      setError("");

      const updatedClient = await updateClientApi(
        clientId,
        adaptClientToApi(updatedData)
      );

      const adaptedClient = adaptClientFromApi(updatedClient);

      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === clientId ? adaptedClient : client
        )
      );

      if (updatedData.oldName && updatedData.oldName !== updatedData.name) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.client === updatedData.oldName
              ? { ...order, client: updatedData.name }
              : order
          )
        );

        setFittings((currentFittings) =>
          currentFittings.map((fitting) =>
            fitting.client === updatedData.oldName
              ? { ...fitting, client: updatedData.name }
              : fitting
          )
        );
      }

      showToast("Клиент обновлён", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось обновить клиента");
      showToast(apiError.message || "Не удалось обновить клиента", "error");
    }
  }

  async function deleteClient(clientId) {
    try {
      setError("");

      await deleteClientApi(clientId);

      setClients((currentClients) =>
        currentClients.filter((client) => client.id !== clientId)
      );

      showToast("Клиент удалён", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось удалить клиента");
      showToast(apiError.message || "Не удалось удалить клиента", "error");
    }
  }

  async function updateClientMeasurements(clientId, measurements) {
    const client = clients.find((item) => item.id === clientId);

    if (!client) {
      showToast("Клиент не найден", "error");
      return;
    }

    await updateClient(clientId, {
      name: client.name,
      phone: client.phone,
      email: client.email,
      comment: client.comment || "",
      measurements,
      oldName: client.name,
    });
  }

  async function addOrder(orderData) {
    try {
      setError("");

      const orderPayload = adaptOrderToApi(orderData, clients);
      const createdOrder = await createOrder(orderPayload);
      const adaptedOrder = adaptOrderFromApi(createdOrder);

      setOrders((currentOrders) => [adaptedOrder, ...currentOrders]);

      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === adaptedOrder.clientId
            ? { ...client, orders: Number(client.orders || 0) + 1 }
            : client
        )
      );

      showToast("Заказ создан", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось создать заказ");
      showToast(apiError.message || "Не удалось создать заказ", "error");
    }
  }

  async function updateOrder(orderId, updatedData) {
    try {
      setError("");

      const existingOrder = orders.find(
        (order) => order.id === orderId || order.backendId === orderId
      );

      if (!existingOrder) {
        showToast("Заказ не найден", "error");
        return;
      }

      const orderPayload = adaptOrderToApi(updatedData, clients);

      const updatedOrderFromApi = await updateOrderApi(
        existingOrder.backendId,
        orderPayload
      );

      const adaptedOrder = adaptOrderFromApi(updatedOrderFromApi);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.backendId === existingOrder.backendId ? adaptedOrder : order
        )
      );

      if (existingOrder.clientId !== adaptedOrder.clientId) {
        setClients((currentClients) =>
          currentClients.map((client) => {
            if (client.id === existingOrder.clientId) {
              return {
                ...client,
                orders: Math.max(Number(client.orders || 0) - 1, 0),
              };
            }

            if (client.id === adaptedOrder.clientId) {
              return {
                ...client,
                orders: Number(client.orders || 0) + 1,
              };
            }

            return client;
          })
        );
      }

      showToast("Заказ обновлён", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось обновить заказ");
      showToast(apiError.message || "Не удалось обновить заказ", "error");
    }
  }

  async function deleteOrder(orderId) {
    try {
      setError("");

      const existingOrder = orders.find(
        (order) => order.id === orderId || order.backendId === orderId
      );

      if (!existingOrder) {
        showToast("Заказ не найден", "error");
        return;
      }

      await deleteOrderApi(existingOrder.backendId);

      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => order.backendId !== existingOrder.backendId
        )
      );

      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === existingOrder.clientId
            ? {
                ...client,
                orders: Math.max(Number(client.orders || 0) - 1, 0),
              }
            : client
        )
      );

      showToast("Заказ удалён", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось удалить заказ");
      showToast(apiError.message || "Не удалось удалить заказ", "error");
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      setError("");

      const existingOrder = orders.find(
        (order) => order.id === orderId || order.backendId === orderId
      );

      if (!existingOrder) {
        showToast("Заказ не найден", "error");
        return;
      }

      const updatedOrderFromApi = await updateOrderStatusApi(
        existingOrder.backendId,
        status
      );

      const adaptedOrder = adaptOrderFromApi(updatedOrderFromApi);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.backendId === existingOrder.backendId ? adaptedOrder : order
        )
      );

      showToast("Статус заказа обновлён", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось обновить статус заказа");
      showToast(
        apiError.message || "Не удалось обновить статус заказа",
        "error"
      );
    }
  }

  async function addFitting(fittingData) {
    try {
      setError("");

      const fittingPayload = adaptFittingToApi(fittingData, clients, orders);
      const createdFitting = await createFitting(fittingPayload);

      setFittings((currentFittings) => [
        adaptFittingFromApi(createdFitting),
        ...currentFittings,
      ]);

      showToast("Примерка создана", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось создать примерку");
      showToast(apiError.message || "Не удалось создать примерку", "error");
    }
  }

  async function updateFitting(fittingId, updatedData) {
    try {
      setError("");

      const existingFitting = fittings.find(
        (fitting) =>
          fitting.id === fittingId || fitting.backendId === fittingId
      );

      if (!existingFitting) {
        showToast("Примерка не найдена", "error");
        return;
      }

      const fittingPayload = adaptFittingToApi(updatedData, clients, orders);

      const updatedFittingFromApi = await updateFittingApi(
        existingFitting.backendId,
        fittingPayload
      );

      const adaptedFitting = adaptFittingFromApi(updatedFittingFromApi);

      setFittings((currentFittings) =>
        currentFittings.map((fitting) =>
          fitting.backendId === existingFitting.backendId
            ? adaptedFitting
            : fitting
        )
      );

      showToast("Примерка обновлена", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось обновить примерку");
      showToast(apiError.message || "Не удалось обновить примерку", "error");
    }
  }

  async function updateFittingStatus(fittingId, status) {
    try {
      setError("");

      const existingFitting = fittings.find(
        (fitting) =>
          fitting.id === fittingId || fitting.backendId === fittingId
      );

      if (!existingFitting) {
        showToast("Примерка не найдена", "error");
        return;
      }

      const updatedFittingFromApi = await updateFittingStatusApi(
        existingFitting.backendId,
        status
      );

      const adaptedFitting = adaptFittingFromApi(updatedFittingFromApi);

      setFittings((currentFittings) =>
        currentFittings.map((fitting) =>
          fitting.backendId === existingFitting.backendId
            ? adaptedFitting
            : fitting
        )
      );

      showToast("Статус примерки обновлён", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось обновить статус примерки");
      showToast(
        apiError.message || "Не удалось обновить статус примерки",
        "error"
      );
    }
  }

  async function deleteFitting(fittingId) {
    try {
      setError("");

      const existingFitting = fittings.find(
        (fitting) =>
          fitting.id === fittingId || fitting.backendId === fittingId
      );

      if (!existingFitting) {
        showToast("Примерка не найдена", "error");
        return;
      }

      await deleteFittingApi(existingFitting.backendId);

      setFittings((currentFittings) =>
        currentFittings.filter(
          (fitting) => fitting.backendId !== existingFitting.backendId
        )
      );

      showToast("Примерка удалена", "success");
    } catch (apiError) {
      setError(apiError.message || "Не удалось удалить примерку");
      showToast(apiError.message || "Не удалось удалить примерку", "error");
    }
  }

  function exportCrmData() {
    return {
      clients,
      orders,
      fittings,
      exportedAt: new Date().toISOString(),
      source: "backend-api",
    };
  }

  function importCrmData() {
    showToast("Импорт backup в backend будет добавлен позже", "info");
    return false;
  }

  function resetCrmData() {
    showToast("Сброс backend-данных будет добавлен позже", "info");
    return false;
  }

  const value = {
    clients,
    orders,
    fittings,
    loading,
    error,

    reloadCrmData: loadCrmData,

    addClient,
    updateClient,
    deleteClient,
    updateClientMeasurements,

    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,

    addFitting,
    updateFitting,
    updateFittingStatus,
    deleteFitting,

    exportCrmData,
    importCrmData,
    resetCrmData,
  };

  if (loading) {
  return <LoadingState />;
}

if (error) {
  return <ErrorState message={error} onRetry={loadCrmData} />;
}
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);

  if (!context) {
    throw new Error("useCrm must be used inside CrmProvider");
  }

  return context;
}