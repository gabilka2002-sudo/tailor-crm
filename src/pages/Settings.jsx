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

  // Эта функция защищает CSV от проблем с запятыми, кавычками и переносами строк.
  // Без неё Excel/Google Sheets могут неправильно открыть файл.
  function escapeCsvValue(value) {
    const stringValue = String(value ?? "");

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replaceAll('"', '""')}"`;
    }

    return stringValue;
  }

  // Универсальная функция скачивания CSV.
  // Мы передаем ей имя файла, заголовки колонок и строки данных.
  function downloadCsv(filename, headers, rows) {
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    // BOM нужен, чтобы Excel нормально открывал русский текст
    const file = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(downloadUrl);
  }

  function handleExportClientsCsv() {
    const headers = [
      "ID",
      "Имя",
      "Телефон",
      "Email",
      "Количество заказов",
      "Комментарий",
      "Плечи",
      "Грудь",
      "Талия",
      "Бёдра",
      "Рукав",
      "Длина изделия",
      "Шея",
      "Рост",
    ];

    const rows = clients.map((client) => [
      client.id,
      client.name,
      client.phone,
      client.email,
      client.orders,
      client.comment || "",
      client.measurements?.shoulders || "",
      client.measurements?.chest || "",
      client.measurements?.waist || "",
      client.measurements?.hips || "",
      client.measurements?.sleeve || "",
      client.measurements?.length || "",
      client.measurements?.neck || "",
      client.measurements?.height || "",
    ]);

    downloadCsv("tailor-crm-clients.csv", headers, rows);
  }

  function handleExportOrdersCsv() {
    const headers = [
      "Номер заказа",
      "Клиент",
      "Изделие",
      "Стоимость",
      "Статус",
      "Срок",
      "Комментарий",
    ];

    const rows = orders.map((order) => [
      order.id,
      order.client,
      order.product,
      order.price,
      order.status,
      order.deadline,
      order.comment || "",
    ]);

    downloadCsv("tailor-crm-orders.csv", headers, rows);
  }

  function handleExportFittingsCsv() {
    const headers = [
      "ID",
      "Клиент",
      "Заказ",
      "Дата",
      "Время",
      "Статус",
      "Комментарий",
    ];

    const rows = fittings.map((fitting) => [
      fitting.id,
      fitting.client,
      fitting.order,
      fitting.date,
      fitting.time,
      fitting.status,
      fitting.comment || "",
    ]);

    downloadCsv("tailor-crm-fittings.csv", headers, rows);
  }

  function handleExportBackup() {
    // Получаем все данные CRM
    const backupData = exportCrmData();

    // Превращаем объект в красивый JSON
    const json = JSON.stringify(backupData, null, 2);

    // Создаем файл прямо в браузере
    const file = new Blob([json], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "tailor-crm-backup.json";
    link.click();

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
        <Header setPage={setPage} />

        <div className="page-header">
          <div>
            <h1>Настройки</h1>
            <p>Управление данными, экспортом и резервными копиями CRM</p>
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
          <h2>Экспорт в CSV</h2>

          <div className="client-details">
            <p>
              CSV-файлы можно открыть в Excel, Google Sheets или отправить
              владельцу ателье как отчёт.
            </p>

            <div className="measurements-grid">
              <button
                className="new-order-button"
                onClick={handleExportClientsCsv}
              >
                Скачать клиентов CSV
              </button>

              <button
                className="new-order-button"
                onClick={handleExportOrdersCsv}
              >
                Скачать заказы CSV
              </button>

              <button
                className="new-order-button"
                onClick={handleExportFittingsCsv}
              >
                Скачать примерки CSV
              </button>
            </div>
          </div>
        </div>

        <div className="orders-card" style={{ marginBottom: "24px" }}>
          <h2>Полная резервная копия</h2>

          <div className="client-details">
            <p>
              Backup JSON сохраняет всю CRM целиком: клиентов, заказы, примерки
              и замеры. Это нужно для восстановления данных.
            </p>

            <button className="new-order-button" onClick={handleExportBackup}>
              Скачать backup JSON
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