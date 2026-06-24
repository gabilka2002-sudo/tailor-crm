import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import OrdersTable from "../components/OrdersTable";
import ClientsPreview from "../components/ClientsPreview";
import QuickActions from "../components/QuickActions";
import RightPanel from "../components/RightPanel";

export default function Dashboard({ setPage }) {
  return (
    <div className="layout">
      <Sidebar activePage="dashboard" setPage={setPage} />

      <main className="content">
        <Header setPage={setPage} />

        <div className="page-header">
          <div>
            <h1>Панель управления</h1>
            <p>Обзор работы ателье и быстрые действия</p>
          </div>
        </div>

        <StatsCards />

        <div className="dashboard-grid">
          <div>
            <OrdersTable />
            <QuickActions setPage={setPage} />
          </div>

          <div>
            <ClientsPreview setPage={setPage} />
            <RightPanel />
          </div>
        </div>
      </main>
    </div>
  );
}