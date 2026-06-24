import { useState } from "react";
import { useCrm } from "../context/CrmContext";
import { isPastDate, isToday } from "../utils/dateUtils";

export default function Header({ setPage }) {
  const { clients, orders, fittings } = useCrm();

  const [globalSearch, setGlobalSearch] = useState("");

  // Просроченные заказы: срок прошёл, но заказ ещё не готов
  const overdueOrders = orders.filter(
    (order) => isPastDate(order.deadline) && order.status !== "Готово"
  );

  // Примерки на сегодня
  const todayFittings = fittings.filter((fitting) => isToday(fitting.date));

  const notificationsCount = overdueOrders.length + todayFittings.length;

  function handleGoToOrders() {
    // Если клиентов нет, заказ создать нельзя
    if (clients.length === 0) {
      alert("Сначала добавь клиента, потом можно будет создать заказ");

      if (setPage) {
        setPage("clients");
      }

      return;
    }

    if (setPage) {
      setPage("orders");
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const query = globalSearch.trim().toLowerCase();

    if (!query) return;

    const foundClient = clients.find(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
    );

    const foundOrder = orders.find(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.client.toLowerCase().includes(query) ||
        order.product.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
    );

    const foundFitting = fittings.find(
      (fitting) =>
        fitting.client.toLowerCase().includes(query) ||
        fitting.order.toLowerCase().includes(query) ||
        fitting.date.toLowerCase().includes(query) ||
        fitting.status.toLowerCase().includes(query)
    );

    if (foundClient) {
      setPage("clients");
      return;
    }

    if (foundOrder) {
      setPage("orders");
      return;
    }

    if (foundFitting) {
      setPage("fittings");
      return;
    }

    alert("Ничего не найдено");
  }

  function handleShowNotifications() {
    if (notificationsCount === 0) {
      alert("Уведомлений нет");
      return;
    }

    const overdueText = overdueOrders
      .map((order) => `• ${order.id} — ${order.client}, срок: ${order.deadline}`)
      .join("\n");

    const fittingsText = todayFittings
      .map(
        (fitting) =>
          `• ${fitting.client}, заказ ${fitting.order}, время: ${fitting.time}`
      )
      .join("\n");

    const message = [
      overdueOrders.length > 0
        ? `Просроченные заказы:\n${overdueText}`
        : null,
      todayFittings.length > 0
        ? `Примерки сегодня:\n${fittingsText}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    alert(message);
  }

  return (
    <header className="header">
      <form className="search" onSubmit={handleSearchSubmit}>
        <span>🔍</span>

        <input
          value={globalSearch}
          onChange={(event) => setGlobalSearch(event.target.value)}
          placeholder="Поиск клиента, заказа, примерки..."
        />
      </form>

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={handleShowNotifications}
          title="Уведомления"
        >
          🔔
          {notificationsCount > 0 && (
            <span style={{ marginLeft: "6px" }}>{notificationsCount}</span>
          )}
        </button>

        <button
          type="button"
          className="new-order-button"
          onClick={handleGoToOrders}
        >
          + Новый заказ
        </button>
      </div>
    </header>
  );
}