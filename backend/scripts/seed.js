import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old demo data...");

  await prisma.fitting.deleteMany();
  await prisma.order.deleteMany();
  await prisma.client.deleteMany();

  console.log("Creating demo clients...");

  const client1 = await prisma.client.create({
    data: {
      name: "Anna Kowalska",
      phone: "+48 500 111 222",
      email: "anna.kowalska@example.com",
      comment: "Невеста. Нужна подгонка свадебного платья.",
      ordersCount: 0,
      measurements: {
        bust: "88",
        waist: "64",
        hips: "92",
        height: "170",
        shoulders: "38",
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Marek Nowak",
      phone: "+48 501 222 333",
      email: "marek.nowak@example.com",
      comment: "Костюм для деловой встречи.",
      ordersCount: 0,
      measurements: {
        chest: "102",
        waist: "86",
        height: "182",
        sleeve: "64",
        shoulders: "46",
      },
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "Julia Zielinska",
      phone: "+48 502 333 444",
      email: "julia.zielinska@example.com",
      comment: "Индивидуальный пошив вечернего платья.",
      ordersCount: 0,
      measurements: {
        bust: "84",
        waist: "60",
        hips: "90",
        height: "168",
      },
    },
  });

  const client4 = await prisma.client.create({
    data: {
      name: "Katarzyna Wisniewska",
      phone: "+48 503 444 555",
      email: "katarzyna.w@example.com",
      comment: "Постоянный клиент. Часто приносит вещи на ремонт.",
      ordersCount: 0,
      measurements: {
        bust: "92",
        waist: "72",
        hips: "98",
        height: "165",
      },
    },
  });

  console.log("Creating demo orders...");

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "#001",
      clientId: client1.id,
      product: "Свадебное платье",
      price: 2400,
      status: "Примерка",
      deadline: new Date("2026-07-20"),
      comment: "Добавить кружево на рукава.",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "#002",
      clientId: client2.id,
      product: "Мужской костюм",
      price: 1300,
      status: "В работе",
      deadline: new Date("2026-07-15"),
      comment: "Классический тёмный костюм.",
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "#003",
      clientId: client3.id,
      product: "Вечернее платье",
      price: 1800,
      status: "Готово",
      deadline: new Date("2026-07-10"),
      comment: "Платье готово к выдаче.",
    },
  });

  const order4 = await prisma.order.create({
    data: {
      orderNumber: "#004",
      clientId: client4.id,
      product: "Ремонт пальто",
      price: 350,
      status: "В работе",
      deadline: new Date("2026-07-08"),
      comment: "Заменить подкладку и пуговицы.",
    },
  });

  console.log("Updating client order counters...");

  await prisma.client.update({
    where: { id: client1.id },
    data: { ordersCount: 1 },
  });

  await prisma.client.update({
    where: { id: client2.id },
    data: { ordersCount: 1 },
  });

  await prisma.client.update({
    where: { id: client3.id },
    data: { ordersCount: 1 },
  });

  await prisma.client.update({
    where: { id: client4.id },
    data: { ordersCount: 1 },
  });

  console.log("Creating demo fittings...");

  await prisma.fitting.create({
    data: {
      clientId: client1.id,
      orderId: order1.id,
      date: new Date("2026-07-05"),
      time: "12:00",
      status: "Запланирована",
      comment: "Первая примерка свадебного платья.",
    },
  });

  await prisma.fitting.create({
    data: {
      clientId: client1.id,
      orderId: order1.id,
      date: new Date("2026-07-12"),
      time: "15:30",
      status: "Запланирована",
      comment: "Финальная примерка перед выдачей.",
    },
  });

  await prisma.fitting.create({
    data: {
      clientId: client2.id,
      orderId: order2.id,
      date: new Date("2026-07-03"),
      time: "10:30",
      status: "Прошла",
      comment: "Проверили посадку пиджака.",
    },
  });

  await prisma.fitting.create({
    data: {
      clientId: client3.id,
      orderId: order3.id,
      date: new Date("2026-07-01"),
      time: "17:00",
      status: "Прошла",
      comment: "Клиент подтвердил финальную длину.",
    },
  });

  console.log("Demo seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });