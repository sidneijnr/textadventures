import "dotenv/config";
import { db } from "./drizzle.ts";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { ProcedureResetarItensChao } from "./procedures/resetarItensChao.ts";

try {
    // https://supabase.com/blog/postgres-as-a-cron-server
    try {
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_cron`);

        await ProcedureResetarItensChao.create(db);
    } catch (error) {
        console.error("Erro ao criar extensão pg_cron ou procedure:", error);
    }
} catch (error) {
    console.error("Erro:", error);
} finally {
    await db.$client.end();
}