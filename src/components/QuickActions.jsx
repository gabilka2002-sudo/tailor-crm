import { Plus, Users, Package, CreditCard, Calendar, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { icon: Plus, label: "Новый заказ" },
    { icon: Users, label: "Клиенты" },
    { icon: Package, label: "Изделия" },
    { icon: CreditCard, label: "Платежи" },
    { icon: Calendar, label: "Календарь" },
    { icon: BarChart3, label: "Отчёты" },
  ];

  return (
    <div className="quick-card">
      <h2>Быстрый доступ</h2>

      <div className="quick-grid">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button className="quick-action" key={action.label}>
              <Icon size={28} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}