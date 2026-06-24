import { Router } from "express";
import prisma from "../db/prisma.js";

const router = Router();

// Генерируем номер заказа в стиле #001, #002, #003
async function getNextOrderNumber() {
  const ordersCount = await prisma.order.count();

  return `#${String(ordersCount + 1).padStart(3, "0")}`;
}

// Превращаем цену из строки "850 €" или "850" в число 850
function parsePrice(value) {
  return Number(String(value || "").replace(/[^\d]/g, ""));
}

// Получить все заказы
router.get("/", async (request, response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: true,
        fittings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    response.json(orders);
  } catch (error) {
    response.status(500).json({
      error: "Failed to fetch orders",
      details: error.message,
    });
  }
});

// Получить один заказ по id
router.get("/:id", async (request, response) => {
  try {
    const orderId = Number(request.params.id);

    if (!orderId) {
      return response.status(400).json({
        error: "Invalid order id",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        client: true,
        fittings: true,
      },
    });

    if (!order) {
      return response.status(404).json({
        error: "Order not found",
      });
    }

    response.json(order);
  } catch (error) {
    response.status(500).json({
      error: "Failed to fetch order",
      details: error.message,
    });
  }
});

// Создать заказ
router.post("/", async (request, response) => {
  try {
    const { clientId, product, price, status, deadline, comment } = request.body;

    if (!clientId || !product || !price || !deadline) {
      return response.status(400).json({
        error: "clientId, product, price and deadline are required",
      });
    }

    const client = await prisma.client.findUnique({
      where: {
        id: Number(clientId),
      },
    });

    if (!client) {
      return response.status(404).json({
        error: "Client not found",
      });
    }

    const numericPrice = parsePrice(price);

    if (!numericPrice || numericPrice <= 0) {
      return response.status(400).json({
        error: "Price must be a positive number",
      });
    }

    const orderNumber = await getNextOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: Number(clientId),
        product: product.trim(),
        price: numericPrice,
        status: status || "В работе",
        deadline: new Date(deadline),
        comment: comment?.trim() || null,
      },
      include: {
        client: true,
      },
    });

    // Обновляем счётчик заказов у клиента
    await prisma.client.update({
      where: {
        id: Number(clientId),
      },
      data: {
        ordersCount: {
          increment: 1,
        },
      },
    });

    response.status(201).json(order);
  } catch (error) {
    response.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
});

// Обновить заказ
router.put("/:id", async (request, response) => {
  try {
    const orderId = Number(request.params.id);

    if (!orderId) {
      return response.status(400).json({
        error: "Invalid order id",
      });
    }

    const { clientId, product, price, status, deadline, comment } = request.body;

    if (!clientId || !product || !price || !deadline) {
      return response.status(400).json({
        error: "clientId, product, price and deadline are required",
      });
    }

    const numericPrice = parsePrice(price);

    if (!numericPrice || numericPrice <= 0) {
      return response.status(400).json({
        error: "Price must be a positive number",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return response.status(404).json({
        error: "Order not found",
      });
    }

    const targetClient = await prisma.client.findUnique({
      where: {
        id: Number(clientId),
      },
    });

    if (!targetClient) {
      return response.status(404).json({
        error: "Client not found",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        clientId: Number(clientId),
        product: product.trim(),
        price: numericPrice,
        status: status || existingOrder.status,
        deadline: new Date(deadline),
        comment: comment?.trim() || null,
      },
      include: {
        client: true,
        fittings: true,
      },
    });

    // Если заказ перенесли на другого клиента,
    // обновляем счётчики заказов у старого и нового клиента.
    if (existingOrder.clientId !== Number(clientId)) {
      await prisma.client.update({
        where: {
          id: existingOrder.clientId,
        },
        data: {
          ordersCount: {
            decrement: 1,
          },
        },
      });

      await prisma.client.update({
        where: {
          id: Number(clientId),
        },
        data: {
          ordersCount: {
            increment: 1,
          },
        },
      });
    }

    response.json(updatedOrder);
  } catch (error) {
    response.status(500).json({
      error: "Failed to update order",
      details: error.message,
    });
  }
});

// Быстро обновить только статус заказа
router.patch("/:id/status", async (request, response) => {
  try {
    const orderId = Number(request.params.id);
    const { status } = request.body;

    if (!orderId) {
      return response.status(400).json({
        error: "Invalid order id",
      });
    }

    if (!status) {
      return response.status(400).json({
        error: "Status is required",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        client: true,
        fittings: true,
      },
    });

    response.json(updatedOrder);
  } catch (error) {
    response.status(500).json({
      error: "Failed to update order status",
      details: error.message,
    });
  }
});

// Удалить заказ
router.delete("/:id", async (request, response) => {
  try {
    const orderId = Number(request.params.id);

    if (!orderId) {
      return response.status(400).json({
        error: "Invalid order id",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        fittings: true,
      },
    });

    if (!order) {
      return response.status(404).json({
        error: "Order not found",
      });
    }

    // Пока не удаляем заказ, если к нему есть примерки.
    // Это защищает историю CRM.
    if (order.fittings.length > 0) {
      return response.status(400).json({
        error: "Cannot delete order with related fittings",
        fittingsCount: order.fittings.length,
      });
    }

    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    // Уменьшаем счётчик заказов у клиента
    await prisma.client.update({
      where: {
        id: order.clientId,
      },
      data: {
        ordersCount: {
          decrement: 1,
        },
      },
    });

    response.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    response.status(500).json({
      error: "Failed to delete order",
      details: error.message,
    });
  }
});

export default router;