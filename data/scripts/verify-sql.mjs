import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const dataDirectory = fileURLToPath(new URL("../", import.meta.url));
const migrationPath = new URL(
  "../migrations/20260728000100_initial/migration.sql",
  import.meta.url,
);
const developmentSeedPath = new URL(
  "../seeds/development.sql",
  import.meta.url,
);

const migrationSql = await readFile(migrationPath, "utf8");
const developmentSeedSql = await readFile(developmentSeedPath, "utf8");
const database = new PGlite();

try {
  await database.exec(migrationSql);
  await database.exec(developmentSeedSql);
  await database.exec(developmentSeedSql);

  const foodCount = await database.query(
    'SELECT count(*)::int AS "count" FROM "foods"',
  );
  const attributeCount = await database.query(
    'SELECT count(*)::int AS "count" FROM "food_attributes"',
  );
  const coverage = await database.query(`
    SELECT
      "dimension"::text AS "dimension",
      count(DISTINCT "value")::int AS "valueCount",
      count(DISTINCT "food_id")::int AS "foodCount"
    FROM "food_attributes"
    GROUP BY "dimension"
    ORDER BY "dimension"
  `);

  if (foodCount.rows[0].count !== 24) {
    throw new Error(`Expected 24 foods, found ${foodCount.rows[0].count}`);
  }

  if (coverage.rows.length !== 5) {
    throw new Error(
      `Expected all 5 attribute dimensions, found ${coverage.rows.length}`,
    );
  }

  for (const row of coverage.rows) {
    if (row.foodCount !== 24) {
      throw new Error(
        `Expected every food to have ${row.dimension}; found ${row.foodCount}`,
      );
    }
  }

  let negativePriceWasRejected = false;
  try {
    await database.exec(`
      INSERT INTO "foods" (
        "slug",
        "name",
        "category",
        "estimated_price",
        "updated_at"
      )
      VALUES ('invalid-price', 'invalid', 'TEST', -1, CURRENT_TIMESTAMP)
    `);
  } catch {
    negativePriceWasRejected = true;
  }

  if (!negativePriceWasRejected) {
    throw new Error("Expected the negative food price CHECK to reject a row");
  }

  console.log(
    JSON.stringify(
      {
        engine: "PGlite PostgreSQL compatibility check",
        dataDirectory,
        foodCount: foodCount.rows[0].count,
        attributeCount: attributeCount.rows[0].count,
        coverage: coverage.rows,
        seedRerun: "passed",
        checkConstraint: "passed",
      },
      null,
      2,
    ),
  );
} finally {
  await database.close();
}
