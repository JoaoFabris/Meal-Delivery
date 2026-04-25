import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@foodapp.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@foodapp.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@foodapp.com" },
    update: {},
    create: {
      name: "João Silva",
      email: "user@foodapp.com",
      password: userPassword,
      role: Role.USER,
    },
  });

  // Create meals
  const meals = await Promise.all([
    prisma.meal.upsert({
      where: { id: "meal-1" },
      update: {},
      create: {
        id: "meal-1",
        name: "X-Burguer Clássico",
        description: "Hambúrguer artesanal com queijo, alface e tomate",
        price: 28.9,
        category: "Burgers",
        imageUrl: "https://www.themealdb.com/images/media/meals/yysqmh1511459840.jpg",
        available: true,
      },
    }),
    prisma.meal.upsert({
      where: { id: "meal-2" },
      update: {},
      create: {
        id: "meal-2",
        name: "Pizza Margherita",
        description: "Pizza com molho de tomate, mussarela e manjericão",
        price: 42.5,
        category: "Pizza",
        imageUrl: "https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg",
        available: true,
      },
    }),
    prisma.meal.upsert({
      where: { id: "meal-3" },
      update: {},
      create: {
        id: "meal-3",
        name: "Salada Caesar",
        description: "Alface romana, croutons, parmesão e molho caesar",
        price: 22.0,
        category: "Salads",
        imageUrl: "https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg",
        available: true,
      },
    }),
    prisma.meal.upsert({
      where: { id: "meal-4" },
      update: {},
      create: {
        id: "meal-4",
        name: "Frango Grelhado",
        description: "Frango grelhado com legumes e arroz integral",
        price: 35.0,
        category: "Chicken",
        imageUrl: "https://www.themealdb.com/images/media/meals/tvttms1511551530.jpg",
        available: true,
      },
    }),
  ]);

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "DELIVERED",
      total: 71.4,
      items: {
        create: [
          { mealId: "meal-1", quantity: 2, price: 28.9 },
          { mealId: "meal-3", quantity: 1, price: 22.0 },
        ],
      },
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   Users created: admin (${admin.email}), user (${user.email})`);
  console.log(`   Meals created: ${meals.length}`);
  console.log(`   Sample order created: ${order.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
