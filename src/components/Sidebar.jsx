import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  Settings,
  Package,
} from "lucide-react";

export default function Sidebar({ activePage, setPage }) {
  const menu = [
    { id: "dashboard", icon: LayoutDashboard, label: "Панель управления" },
    { id: "orders", icon: ClipboardList, label: "Заказы" },
    { id: "clients", icon: Users, label: "Клиенты" },
    { id: "fittings", icon: Calendar, label: "Примерки" },
    { id: "settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <Package size={28} />
        <strong>ATELIER CRM</strong>
      </div>

      <nav className="menu">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={activePage === item.id ? "active" : ""}
              onClick={() => setPage(item.id)}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}