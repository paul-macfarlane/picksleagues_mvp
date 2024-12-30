import { migrate } from "drizzle-orm/libsql/migrator";
import { scriptDB } from "@/db/scriptClient";

function main() {
  void migrate(scriptDB, { migrationsFolder: "./drizzle" });
}

main();
