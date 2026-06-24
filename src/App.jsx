import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";
import Fittings from "./pages/Fittings";
import Settings from "./pages/Settings";
import { CrmProvider } from "./context/CrmContext";

export default function App() {
  // Храним текущую открытую страницу CRM
  const [page, setPage] = useState("dashboard");

  // Все страницы приложения.
  // Пока используем простую навигацию через useState.
  // Позже, если понадобится, можно будет перейти на React Router.
  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    clients: <Clients setPage={setPage} />,
    orders: <Orders setPage={setPage} />,
    fittings: <Fittings setPage={setPage} />,
    settings: <Settings setPage={setPage} />,
  };

  // Защита: если по какой-то причине page станет неправильным,
  // показываем Dashboard, а не пустой экран.
  const currentPage = pages[page] || pages.dashboard;

  return <CrmProvider>{currentPage}</CrmProvider>;
}