import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useCrm } from "../context/CrmContext";

export default function Fittings({ setPage }) {
  // Берем примерки, клиентов, заказы и функции из общего CRM-хранилища
  const {
    fittings,
    clients,
    orders,
    addFitting,
    updateFittingStatus,
    deleteFitting,
  } = useCrm();

  // Показывать или скрывать форму создания примерки
  const [showForm, setShowForm] = useState(false);

  // Текст поиска по примеркам
  const [search, setSearch] = useState("");

  // Примерка, которую пользователь открыл кликом
  const [selectedFitting, setSelectedFitting] = useState(null);

  // Фильтруем примерки по клиенту, заказу, дате или статусу
  const filteredFittings = fittings.filter((fitting) => {
    const searchText = search.toLowerCase();

    return (
      fitting.client.toLowerCase().includes(searchText) ||
      fitting.order.toLowerCase().includes(searchText) ||
      fitting.date.toLowerCase().includes(searchText) ||
      fitting.status.toLowerCase().includes(searchText)
    );
  });

  function handleAddFitting(event) {
    event.preventDefault();

    // FormData забирает значения из формы по name=""
    const formData = new FormData(event.currentTarget);

    const newFitting = {
      client: formData.get("client"),
      order: formData.get("order"),
      date: formData.get("date"),
      time: formData.get("time"),
      status: formData.get("status"),
      comment: formData.get("comment"),
    };

    // Сохраняем примерку в общем CRM-хранилище
    addFitting(newFitting);

    // Закрываем форму
    setShowForm(false);
  }

  function handleDeleteFitting(fittingId) {
    const isConfirmed = window.confirm("Удалить эту примерку?");

    if (!isConfirmed) return;

    // Удаляем примерку из общего CRM-хранилища
    deleteFitting(fittingId);

    // Закрываем карточку, если она была открыта
    setSelectedFitting(null);
  }

  function handleChangeFittingStatus(fittingId, status) {
    // Меняем статус в общем CRM-хранилище
    updateFittingStatus(fittingId, status);

    // Обновляем открытую карточку, чтобы статус сразу изменился на экране
    setSelectedFitting((currentFitting) =>
      currentFitting
        ? {
            ...currentFitting,
            status,
          }
        : null
    );
  }

  return (
    <div className="layout">
      <Sidebar activePage="fittings" setPage={setPage} />

      <main className="content">
        <Header />

        <div className="page-header">
          <div>
            <h1>Примерки</h1>
            <p>Планирование и контроль примерок</p>
          </div>

          <button className="new-order-button" onClick={() => setShowForm(true)}>
            + Новая примерка
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Новая примерка</h2>
                <button onClick={() => setShowForm(false)}>×</button>
              </div>

              <form className="client-form" onSubmit={handleAddFitting}>
                <label>
                  Клиент
                  <select name="client" required>
                    <option value="">Выберите клиента</option>

                    {clients.map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Заказ
                  <select name="order" required>
                    <option value="">Выберите заказ</option>

                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.id} — {order.product}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Дата
                  <input name="date" type="date" required />
                </label>

                <label>
                  Время
                  <input name="time" type="time" required />
                </label>

                <label>
                  Статус
                  <select name="status" required>
                    <option>Запланирована</option>
                    <option>Прошла</option>
                    <option>Отменена</option>
                  </select>
                </label>

                <label>
                  Комментарий
                  <textarea
                    name="comment"
                    placeholder="Например: проверить длину рукавов..."
                  />
                </label>

                <button type="submit" className="new-order-button">
                  Сохранить примерку
                </button>
              </form>
            </div>
          </div>
        )}

        <input
          className="client-search"
          placeholder="Поиск примерки..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="orders-card">
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Заказ</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredFittings.map((fitting) => (
                <tr
                  key={fitting.id}
                  onClick={() => setSelectedFitting(fitting)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{fitting.client}</td>
                  <td>{fitting.order}</td>
                  <td>{fitting.date}</td>
                  <td>{fitting.time}</td>
                  <td>{fitting.status}</td>
                  <td>
                    <button
                      className="delete-client-button"
                      onClick={(event) => {
                        // Чтобы кнопка удаления не открывала карточку примерки
                        event.stopPropagation();
                        handleDeleteFitting(fitting.id);
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFittings.length === 0 && (
            <p style={{ padding: "24px", color: "#777" }}>
              Примерки не найдены
            </p>
          )}
        </div>

        {selectedFitting && (
          <div className="modal-overlay">
            <div className="client-modal">
              <div className="modal-head">
                <h2>Примерка</h2>
                <button onClick={() => setSelectedFitting(null)}>×</button>
              </div>

              <div className="client-details">
                <p>
                  <strong>Клиент:</strong> {selectedFitting.client}
                </p>

                <p>
                  <strong>Заказ:</strong> {selectedFitting.order}
                </p>

                <p>
                  <strong>Дата:</strong> {selectedFitting.date}
                </p>

                <p>
                  <strong>Время:</strong> {selectedFitting.time}
                </p>

                <p>
                  <strong>Статус:</strong> {selectedFitting.status}
                </p>

                {selectedFitting.comment && (
                  <p>
                    <strong>Комментарий:</strong> {selectedFitting.comment}
                  </p>
                )}

                <h3>Изменить статус</h3>

                <div className="measurements-grid">
                  <button
                    className="new-order-button"
                    onClick={() =>
                      handleChangeFittingStatus(
                        selectedFitting.id,
                        "Запланирована"
                      )
                    }
                  >
                    Запланирована
                  </button>

                  <button
                    className="new-order-button"
                    onClick={() =>
                      handleChangeFittingStatus(selectedFitting.id, "Прошла")
                    }
                  >
                    Прошла
                  </button>

                  <button
                    className="new-order-button"
                    onClick={() =>
                      handleChangeFittingStatus(selectedFitting.id, "Отменена")
                    }
                  >
                    Отменена
                  </button>
                </div>

                <button
                  className="delete-client-button"
                  onClick={() => handleDeleteFitting(selectedFitting.id)}
                >
                  Удалить примерку
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}