import { Router } from "express";
import prisma from "../db/prisma.js";

const router = Router();

// Получить все примерки
router.get("/", async (request, response) => {
  try {
    const fittings = await prisma.fitting.findMany({
      include: {
        client: true,
        order: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    response.json(fittings);
  } catch (error) {
    response.status(500).json({
      error: "Failed to fetch fittings",
      details: error.message,
    });
  }
});

// Получить одну примерку по id
router.get("/:id", async (request, response) => {
  try {
    const fittingId = Number(request.params.id);

    if (!fittingId) {
      return response.status(400).json({
        error: "Invalid fitting id",
      });
    }

    const fitting = await prisma.fitting.findUnique({
      where: {
        id: fittingId,
      },
      include: {
        client: true,
        order: true,
      },
    });

    if (!fitting) {
      return response.status(404).json({
        error: "Fitting not found",
      });
    }

    response.json(fitting);
  } catch (error) {
    response.status(500).json({
      error: "Failed to fetch fitting",
      details: error.message,
    });
  }
});

// Создать примерку
router.post("/", async (request, response) => {
  try {
    const { clientId, orderId, date, time, status, comment } = request.body;

    if (!clientId || !orderId || !date || !time) {
      return response.status(400).json({
        error: "clientId, orderId, date and time are required",
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

    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      return response.status(404).json({
        error: "Order not found",
      });
    }

    if (order.clientId !== Number(clientId)) {
      return response.status(400).json({
        error: "Order does not belong to this client",
      });
    }

    const fitting = await prisma.fitting.create({
      data: {
        clientId: Number(clientId),
        orderId: Number(orderId),
        date: new Date(date),
        time,
        status: status || "Запланирована",
        comment: comment?.trim() || null,
      },
      include: {
        client: true,
        order: true,
      },
    });

    response.status(201).json(fitting);
  } catch (error) {
    response.status(500).json({
      error: "Failed to create fitting",
      details: error.message,
    });
  }
});

// Обновить примерку
router.put("/:id", async (request, response) => {
  try {
    const fittingId = Number(request.params.id);

    if (!fittingId) {
      return response.status(400).json({
        error: "Invalid fitting id",
      });
    }

    const { clientId, orderId, date, time, status, comment } = request.body;

    if (!clientId || !orderId || !date || !time) {
      return response.status(400).json({
        error: "clientId, orderId, date and time are required",
      });
    }

    const fitting = await prisma.fitting.findUnique({
      where: {
        id: fittingId,
      },
    });

    if (!fitting) {
      return response.status(404).json({
        error: "Fitting not found",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      return response.status(404).json({
        error: "Order not found",
      });
    }

    if (order.clientId !== Number(clientId)) {
      return response.status(400).json({
        error: "Order does not belong to this client",
      });
    }

    const updatedFitting = await prisma.fitting.update({
      where: {
        id: fittingId,
      },
      data: {
        clientId: Number(clientId),
        orderId: Number(orderId),
        date: new Date(date),
        time,
        status: status || fitting.status,
        comment: comment?.trim() || null,
      },
      include: {
        client: true,
        order: true,
      },
    });

    response.json(updatedFitting);
  } catch (error) {
    response.status(500).json({
      error: "Failed to update fitting",
      details: error.message,
    });
  }
});

// Быстро обновить только статус примерки
router.patch("/:id/status", async (request, response) => {
  try {
    const fittingId = Number(request.params.id);
    const { status } = request.body;

    if (!fittingId) {
      return response.status(400).json({
        error: "Invalid fitting id",
      });
    }

    if (!status) {
      return response.status(400).json({
        error: "Status is required",
      });
    }

    const updatedFitting = await prisma.fitting.update({
      where: {
        id: fittingId,
      },
      data: {
        status,
      },
      include: {
        client: true,
        order: true,
      },
    });

    response.json(updatedFitting);
  } catch (error) {
    response.status(500).json({
      error: "Failed to update fitting status",
      details: error.message,
    });
  }
});

// Удалить примерку
router.delete("/:id", async (request, response) => {
  try {
    const fittingId = Number(request.params.id);

    if (!fittingId) {
      return response.status(400).json({
        error: "Invalid fitting id",
      });
    }

    const fitting = await prisma.fitting.findUnique({
      where: {
        id: fittingId,
      },
    });

    if (!fitting) {
      return response.status(404).json({
        error: "Fitting not found",
      });
    }

    await prisma.fitting.delete({
      where: {
        id: fittingId,
      },
    });

    response.json({
      message: "Fitting deleted successfully",
    });
  } catch (error) {
    response.status(500).json({
      error: "Failed to delete fitting",
      details: error.message,
    });
  }
});

export default router;