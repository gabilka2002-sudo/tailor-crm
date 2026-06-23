import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import OrdersTable from "../components/OrdersTable";
import RightPanel from "../components/RightPanel";
import QuickActions from "../components/QuickActions";
import ClientsPreview from "../components/ClientsPreview";

export default function Dashboard({ setPage }) {
  return (
    <div className="layout">
      <Sidebar activePage="dashboard" setPage={setPage} />

      <main className="content">
        <Header />

        <h1>Панель управления</h1>
        <p>Обзор ателье</p>

        <div className="dashboard-grid">
          <section>
            {/* Карточки статистики теперь берут реальные данные из CrmContext */}
            <StatsCards />

            {/* Таблица последних заказов теперь тоже показывает реальные заказы */}
            <OrdersTable />

            <QuickActions />

            {/* Последние клиенты теперь берутся из общего CRM-хранилища */}
            <ClientsPreview setPage={setPage} />
          </section>

          <RightPanel />
        </div>
      </main>
    </div>
  );
}