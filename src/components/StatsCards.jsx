export default function StatsCards() {
  const stats = [
    {
      title: "Новые заказы",
      value: "14",
    },
    {
      title: "В работе",
      value: "30",
    },
    {
      title: "Готово к выдаче",
      value: "8",
    },
    {
      title: "Выручка",
      value: "275 000 zł",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item) => (
        <div className="stat-card" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
}