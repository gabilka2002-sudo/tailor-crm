import { Bell, Plus, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={20} />
        <input placeholder="Поиск клиентов, заказов..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-button">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <button className="new-order-button">
          <Plus size={18} />
          Новый заказ
        </button>

        <div className="profile">
          <div className="avatar">A</div>
          <div>
            <strong>Анна Петрова</strong>
            <span>Администратор</span>
          </div>
        </div>
      </div>
    </header>
  );
}