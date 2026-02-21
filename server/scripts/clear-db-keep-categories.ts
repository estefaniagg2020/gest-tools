import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const { Pool } = pg;

const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

const quoteIdent = (value: string): string => `"${value.replace(/"/g, '""')}"`;

async function main() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definido");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const categoriesResult = await client.query('SELECT * FROM "ServiceCategory" ORDER BY "createdAt" ASC, "id" ASC');
    const servicesResult = await client.query('SELECT * FROM "Service" ORDER BY "createdAt" ASC, "id" ASC');
    const backupDir = join(process.cwd(), "prisma", "backups");
    await mkdir(backupDir, { recursive: true });
    const backupFile = join(backupDir, `catalog-${timestamp}.json`);
    await writeFile(
      backupFile,
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          tables: {
            ServiceCategory: categoriesResult.rows,
            Service: servicesResult.rows,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await client.query("BEGIN");
    await client.query('UPDATE "ServiceCategory" SET "sourceCategoryId" = NULL WHERE "sourceCategoryId" IS NOT NULL');

    const keepTables = [
      "ServiceCategory",
      "Business",
      "Company",
      "Profession",
      "ProfessionCategory",
      "ProfessionService",
      "ProfessionSynonym",
      "Role",
      "_prisma_migrations",
    ];
    const tablesResult = await client.query<{ tablename: string }>(
      `
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> ALL($1::text[])
      `,
      [keepTables],
    );

    const tablesToTruncate = tablesResult.rows.map((row) => row.tablename);
    if (tablesToTruncate.length > 0) {
      const truncateSql = `TRUNCATE TABLE ${tablesToTruncate.map(quoteIdent).join(", ")} RESTART IDENTITY CASCADE`;
      await client.query(truncateSql);
    }

    await client.query(`
      DELETE FROM "Business" b
      WHERE NOT EXISTS (
        SELECT 1
        FROM "ServiceCategory" c
        WHERE c."businessId" = b."id"
      )
    `);

    await client.query(`
      DELETE FROM "Company" co
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Business" b
        WHERE b."companyId" = co."id"
      )
    `);

    await client.query("COMMIT");

    console.log(`[ok] Backup creado: ${backupFile}`);
    console.log(`[ok] Categorías preservadas: ${categoriesResult.rowCount}`);
    console.log(`[ok] Servicios respaldados: ${servicesResult.rowCount}`);
    console.log(`[ok] Tablas truncadas: ${tablesToTruncate.length}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[error] clear-db-keep-categories", error);
  process.exit(1);
});
