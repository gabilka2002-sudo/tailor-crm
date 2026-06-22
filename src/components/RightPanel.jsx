export default function RightPanel() {
  const fittings = [
    { time: "11:00", client: "Иванов И.И.", order: "#001" },
    { time: "14:00", client: "Петрова А.А.", order: "#002" },
    { time: "16:00", client: "Смирнова Д.А.", order: "#003" },
  ];

  return (
    <aside className="right-panel">
      <div className="panel-card">
        <h2>Календарь</h2>

        <div className="calendar-head">
          <span>Июнь 2026</span>
        </div>

        <div className="calendar-grid">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <strong key={day}>{day}</strong>
          ))}

          {[15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(
            (date) => (
              <button className={date === 22 ? "selected" : ""} key={date}>
                {date}
              </button>
            )
          )}
        </div>
      </div>

      <div className="panel-card">
        <h2>Ближайшие примерки</h2>

        <div className="fittings-list">
          {fittings.map((item) => (
            <div className="fitting-item" key={item.time}>
              <span>{item.time}</span>
              <div>
                <strong>{item.client}</strong>
                <p>{item.order}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}