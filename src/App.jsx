import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";
import Fittings from "./pages/Fittings";
import Settings from "./pages/Settings";
import { CrmProvider } from "./context/CrmContext";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    clients: <Clients setPage={setPage} />,
    orders: <Orders setPage={setPage} />,
    fittings: <Fittings setPage={setPage} />,
    settings: <Settings setPage={setPage} />,
  };

  return <CrmProvider>{pages[page]}</CrmProvider>;
}