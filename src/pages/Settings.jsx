import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useCrm } from "../context/CrmContext";

export default function Settings({ setPage }) {
  // Берем данные и функции настроек из общего CRM-хранилища
  const {
    clients,
    orders,
    fittings,
    exportCrmData,
    importCrmData,
    resetCrmData,
  } = useCrm();

  // Считаем активные заказы
  const activeOrders = orders.filter(
    (order) => order.status === "В работе" || order.status === "Примерка"
  );

  // Считаем запланированные примерки
  const plannedFittings = fittings.filter(
    (fitting) => fitting.status === "Запланирована"
  );

  function handleExportBackup() {
    // Получаем все данные CRM
    const backupData = exportCrmData();

    // Превращаем объект в красивый JSON
    const json = JSON.stringify(backupData, null, 2);

    // Создаем файл прямо в браузере
    const file = new Blob([json], {
      type: "application/json",
    });

    // Создаем временную ссылку для скачивания
    const downloadUrl = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "tailor-crm-backup.json";
    link.click();

    // Чистим временную ссылку
    URL.revokeObjectURL(downloadUrl);
  }

  function handleImportBackup(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        // Читаем JSON из файла
        const backupData = JSON.parse(reader.result);

        // Передаем данные в CRM-хранилище
        importCrmData(backupData);

        alert("Резервная копия успешно восстановлена");
      } catch {
        alert("Не удалось импортировать файл. Проверь формат backup-файла.");
      }
    };

    reader.readAsText(file);
  }

  function handleResetData() {
    const isConfirmed = window.confirm(
      "Ты точно хочешь сбросить все данные CRM к стартовым? Это действие нельзя отменить."
    );

    if (!isConfirmed) return;

    resetCrmData();

    alert("Данные CRM сброшены к стартовым");
  }

  return (
    <div className="layout">
      <Sidebar activePage="settings" setPage={setPage} />

      <main className="content">
        <Header />

        <div className="page-header">
          <div>
            <h1>Настройки</h1>
            <p>Управление данными и резервными копиями CRM</p>
          </div>
        </div>

        <div className="orders-card" style={{ marginBottom: "24px" }}>
          <h2>Статистика CRM</h2>

          <div className="measurements-grid">
            <span>Клиенты: {clients.length}</span>
            <span>Заказы: {orders.length}</span>
            <span>Активные заказы: {activeOrders.length}</span>
            <span>Примерки: {fittings.length}</span>
            <span>Запланированные примерки: {plannedFittings.length}</span>
          </div>
        </div>

        <div className="orders-card" style={{ marginBottom: "24px" }}>
          <h2>Резервная копия</h2>

          <div className="client-details">
            <p>
              Здесь можно скачать резервную копию клиентов, заказов и примерок.
              Это полезно перед большими изменениями в коде.
            </p>

            <button className="new-order-button" onClick={handleExportBackup}>
              Скачать backup
            </button>
          </div>
        </div>

        <div className="orders-card" style={{ marginBottom: "24px" }}>
          <h2>Восстановление данных</h2>

          <div className="client-details">
            <p>
              Загрузи файл <strong>tailor-crm-backup.json</strong>, чтобы
              восстановить данные CRM.
            </p>

            <input type="file" accept=".json" onChange={handleImportBackup} />
          </div>
        </div>

        <div className="orders-card">
          <h2>Опасная зона</h2>

          <div className="client-details">
            <p>
              Сброс удалит текущих клиентов, заказы и примерки из браузера и
              вернет стартовые тестовые данные.
            </p>

            <button className="delete-client-button" onClick={handleResetData}>
              Сбросить данные CRM
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}