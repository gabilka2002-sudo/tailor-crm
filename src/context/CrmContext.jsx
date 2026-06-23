import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  initialClients,
  initialOrders,
  initialFittings,
} from "../data/initialData";

const CrmContext = createContext(null);

const STORAGE_KEY = "tailor-crm-state";

// Определяем CSS-класс для цвета статуса заказа
function getStatusClass(status) {
  if (status === "Готово") return "green";
  if (status === "Примерка") return "purple";
  return "blue";
}

// Загружаем данные из localStorage.
// Если данных нет — используем стартовые данные из initialData.js
function getInitialState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return {
      clients: initialClients,
      orders: initialOrders,
      fittings: initialFittings,
    };
  }

  try {
    const parsedState = JSON.parse(savedState);

    return {
      clients: parsedState.clients || initialClients,
      orders: parsedState.orders || initialOrders,
      fittings: parsedState.fittings || initialFittings,
    };
  } catch {
    return {
      clients: initialClients,
      orders: initialOrders,
      fittings: initialFittings,
    };
  }
}

// Генерируем следующий номер заказа: #001, #002, #003...
function getNextOrderId(orders) {
  const maxNumber = orders.reduce((max, order) => {
    const number = Number(String(order.id).replace("#", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `#${String(maxNumber + 1).padStart(3, "0")}`;
}

export function CrmProvider({ children }) {
  const initialState = getInitialState();

  // Общий список клиентов
  const [clients, setClients] = useState(initialState.clients);

  // Общий список заказов
  const [orders, setOrders] = useState(initialState.orders);

  // Общий список примерок
  const [fittings, setFittings] = useState(initialState.fittings);

  // Автоматически сохраняем клиентов, заказы и примерки в браузер
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        clients,
        orders,
        fittings,
      })
    );
  }, [clients, orders, fittings]);

  // Добавляет нового клиента
  const addClient = (clientData) => {
    const newClient = {
      id: Date.now(),
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      comment: clientData.comment || "",
      orders: 0,
      measurements: {
        shoulders: "",
        chest: "",
        waist: "",
        hips: "",
        sleeve: "",
        length: "",
        neck: "",
        height: "",
      },
    };

    setClients((currentClients) => [newClient, ...currentClients]);
  };

  // Обновляет основные данные клиента
  const updateClient = (clientId, updatedData) => {
    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              name: updatedData.name,
              phone: updatedData.phone,
              email: updatedData.email,
              comment: updatedData.comment || "",
            }
          : client
      )
    );

    // Если имя клиента изменилось — обновляем его в заказах
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.client === updatedData.oldName
          ? {
              ...order,
              client: updatedData.name,
            }
          : order
      )
    );

    // Если имя клиента изменилось — обновляем его в примерках
    setFittings((currentFittings) =>
      currentFittings.map((fitting) =>
        fitting.client === updatedData.oldName
          ? {
              ...fitting,
              client: updatedData.name,
            }
          : fitting
      )
    );
  };

  // Удаляет клиента
  const deleteClient = (clientId) => {
    setClients((currentClients) =>
      currentClients.filter((client) => client.id !== clientId)
    );
  };

  // Обновляет замеры конкретного клиента
  const updateClientMeasurements = (clientId, measurements) => {
    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              measurements,
            }
          : client
      )
    );
  };

  // Добавляет новый заказ
  const addOrder = (orderData) => {
    const newOrder = {
      id: getNextOrderId(orders),
      client: orderData.client,
      product: orderData.product,
      price: orderData.price,
      status: orderData.status,
      statusClass: getStatusClass(orderData.status),
      deadline: orderData.deadline,
      comment: orderData.comment || "",
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);

    // Увеличиваем счетчик заказов у клиента
    setClients((currentClients) =>
      currentClients.map((client) =>
        client.name === orderData.client
          ? { ...client, orders: client.orders + 1 }
          : client
      )
    );
  };

  // Обновляет данные заказа
  const updateOrder = (orderId, updatedData) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              client: updatedData.client,
              product: updatedData.product,
              price: updatedData.price,
              status: updatedData.status,
              statusClass: getStatusClass(updatedData.status),
              deadline: updatedData.deadline,
              comment: updatedData.comment || "",
            }
          : order
      )
    );
  };

  // Удаляет заказ
  const deleteOrder = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );
  };

  // Меняет статус заказа
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusClass: getStatusClass(newStatus),
            }
          : order
      )
    );
  };

  // Создает новую примерку
  const addFitting = (fittingData) => {
    const newFitting = {
      id: Date.now(),
      client: fittingData.client,
      order: fittingData.order,
      date: fittingData.date,
      time: fittingData.time,
      status: fittingData.status || "Запланирована",
      comment: fittingData.comment || "",
    };

    setFittings((currentFittings) => [newFitting, ...currentFittings]);
  };

  // Обновляет данные примерки: клиент, заказ, дата, время, статус, комментарий
  const updateFitting = (fittingId, updatedData) => {
    setFittings((currentFittings) =>
      currentFittings.map((fitting) =>
        fitting.id === fittingId
          ? {
              ...fitting,
              client: updatedData.client,
              order: updatedData.order,
              date: updatedData.date,
              time: updatedData.time,
              status: updatedData.status,
              comment: updatedData.comment || "",
            }
          : fitting
      )
    );
  };

  // Меняет только статус примерки
  const updateFittingStatus = (fittingId, status) => {
    setFittings((currentFittings) =>
      currentFittings.map((fitting) =>
        fitting.id === fittingId
          ? {
              ...fitting,
              status,
            }
          : fitting
      )
    );
  };

  // Удаляет примерку
  const deleteFitting = (fittingId) => {
    setFittings((currentFittings) =>
      currentFittings.filter((fitting) => fitting.id !== fittingId)
    );
  };

  // Возвращает все данные CRM для резервной копии
  const exportCrmData = () => {
    return {
      clients,
      orders,
      fittings,
      exportedAt: new Date().toISOString(),
      app: "TailorCRM",
    };
  };

  // Импортирует данные CRM из резервной копии
  const importCrmData = (backupData) => {
    if (
      !backupData ||
      !Array.isArray(backupData.clients) ||
      !Array.isArray(backupData.orders) ||
      !Array.isArray(backupData.fittings)
    ) {
      throw new Error("Неверный формат файла резервной копии");
    }

    setClients(backupData.clients);
    setOrders(backupData.orders);
    setFittings(backupData.fittings);
  };

  // Полностью сбрасывает CRM к стартовым данным
  const resetCrmData = () => {
    setClients(initialClients);
    setOrders(initialOrders);
    setFittings(initialFittings);
  };

  // Всё, что мы передаем другим компонентам через useCrm()
  const value = useMemo(
    () => ({
      clients,
      orders,
      fittings,

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
    }),
    [clients, orders, fittings]
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

// Хук для доступа к CRM-данным в любом компоненте
export function useCrm() {
  const context = useContext(CrmContext);

  if (!context) {
    throw new Error("useCrm должен использоваться внутри CrmProvider");
  }

  return context;
}