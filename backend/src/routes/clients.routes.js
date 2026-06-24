import { Router } from "express";
import prisma from "../db/prisma.js";

const router = Router();

// Получить всех клиентов
router.get("/", async (request, response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    response.json(clients);
  } catch (error) {
    response.status(500).json({
      error: "Failed to fetch clients",
      details: error.message,
    });
  }
});

// Получить одного клиента по id
router.get("/:id", async (request, response) => {
  try {
    const clientId = Number(request.params.id);

    if (!clientId) {
      return response.status(400).json({
        error: "Invalid client id",
      });
    }

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        orders: true,
        fittings: true,
      },
    });

    if (!client) {
      return response.status(404).json({
        error: "Client not found",
      });
    }

    response.json(client);
  } catch (error) {
    response.status(500).json({
      error: "Failed to fetch client",
      details: error.message,
    });
  }
});

// Создать клиента
router.post("/", async (request, response) => {
  try {
    const { name, phone, email, comment, measurements } = request.body;

    if (!name || !phone || !email) {
      return response.status(400).json({
        error: "Name, phone and email are required",
      });
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        comment: comment?.trim() || null,
        measurements: measurements || null,
      },
    });

    response.status(201).json(client);
  } catch (error) {
    response.status(500).json({
      error: "Failed to create client",
      details: error.message,
    });
  }
});

// Обновить клиента
router.put("/:id", async (request, response) => {
  try {
    const clientId = Number(request.params.id);

    if (!clientId) {
      return response.status(400).json({
        error: "Invalid client id",
      });
    }

    const { name, phone, email, comment, measurements } = request.body;

    if (!name || !phone || !email) {
      return response.status(400).json({
        error: "Name, phone and email are required",
      });
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        comment: comment?.trim() || null,
        measurements: measurements || null,
      },
    });

    response.json(updatedClient);
  } catch (error) {
    response.status(500).json({
      error: "Failed to update client",
      details: error.message,
    });
  }
});

// Удалить клиента
router.delete("/:id", async (request, response) => {
  try {
    const clientId = Number(request.params.id);

    if (!clientId) {
      return response.status(400).json({
        error: "Invalid client id",
      });
    }

    // Проверяем связанные заказы и примерки.
    // Клиента с историей пока не удаляем, чтобы не ломать данные.
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        orders: true,
        fittings: true,
      },
    });

    if (!client) {
      return response.status(404).json({
        error: "Client not found",
      });
    }

    if (client.orders.length > 0 || client.fittings.length > 0) {
      return response.status(400).json({
        error: "Cannot delete client with related orders or fittings",
        ordersCount: client.orders.length,
        fittingsCount: client.fittings.length,
      });
    }

    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });

    response.json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    response.status(500).json({
      error: "Failed to delete client",
      details: error.message,
    });
  }
});

export default router;