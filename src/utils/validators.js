// Проверяет, что строка не пустая
export function isNotEmpty(value) {
  return String(value || "").trim().length > 0;
}

// Проверяет, что цена является числом.
// Разрешаем: 500, 500€, 500 €, 1200
export function isValidPrice(value) {
  const numericValue = String(value || "").replace(/[^\d]/g, "");

  return numericValue.length > 0 && Number(numericValue) > 0;
}

// Приводит цену к нормальному виду: "500 €"
export function normalizePrice(value) {
  const numericValue = String(value || "").replace(/[^\d]/g, "");

  return `${numericValue} €`;
}

// Проверяет дату.
// Разрешаем два формата:
// 20.07.2026
// 2026-07-20
export function isValidDate(value) {
  const date = String(value || "").trim();

  const dotFormat = /^\d{2}\.\d{2}\.\d{4}$/;
  const dashFormat = /^\d{4}-\d{2}-\d{2}$/;

  return dotFormat.test(date) || dashFormat.test(date);
}

// Проверяет данные заказа перед сохранением
export function validateOrderData(orderData) {
  if (!isNotEmpty(orderData.client)) {
    return "Выберите клиента";
  }

  if (!isNotEmpty(orderData.product)) {
    return "Укажите изделие";
  }

  if (!isValidPrice(orderData.price)) {
    return "Стоимость должна быть числом больше нуля";
  }

  if (!isNotEmpty(orderData.status)) {
    return "Выберите статус заказа";
  }

  if (!isValidDate(orderData.deadline)) {
    return "Дата должна быть в формате 20.07.2026 или 2026-07-20";
  }

  return null;
}