// Универсальный парсер даты для CRM.
// Поддерживает:
// 2026-07-20
// 20.07.2026
export function parseCrmDate(dateString) {
  const value = String(dateString || "").trim();

  // Формат: 2026-07-20
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value);
  }

  // Формат: 20.07.2026
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [day, month, year] = value.split(".");
    return new Date(`${year}-${month}-${day}`);
  }

  return null;
}

// Превращает цену "850 €" или "850" в число 850
export function parsePrice(price) {
  return Number(String(price || "").replace(/[^\d]/g, "")) || 0;
}

// Проверяет, является ли дата сегодняшним днём
export function isToday(dateString) {
  const date = parseCrmDate(dateString);

  if (!date) return false;

  const today = new Date();

  return date.toDateString() === today.toDateString();
}

// Проверяет, прошла ли дата.
// Полезно для просроченных заказов.
export function isPastDate(dateString) {
  const date = parseCrmDate(dateString);

  if (!date) return false;

  const today = new Date();

  // Обнуляем время, чтобы сравнивать именно дни, а не часы/минуты
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
}