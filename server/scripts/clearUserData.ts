import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword, generateSalt } from "../src/utils/password.js";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const deletedAppointments = await prisma.appointment.deleteMany({});
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(
    `Borrados: ${deletedAppointments.count} reserva(s), ${deletedUsers.count} usuario(s).`,
  );

  const salt = generateSalt();
  const passwordHash = hashPassword(DEMO_PASSWORD, salt);
  await prisma.user.create({
    data: {
      username: DEMO_USERNAME,
      passwordHash,
      salt,
      role: "gestor",
    },
  });
  console.log(
    `Usuario demo creado: ${DEMO_USERNAME} / ${DEMO_PASSWORD} (puedes seguir entrando con estas credenciales).`,
  );
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
