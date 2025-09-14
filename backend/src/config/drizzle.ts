// https://supabase.com/docs/guides/database/drizzle
// https://orm.drizzle.team/docs/get-started/supabase-existing
// Parece que supabase prefere o uso do "postgres" em vez do "pg"
import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) { throw new Error("POSTGRES_URL is not set in environment variables"); }

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle({
    client,
    logger: process.env.DEBUGLOG === "true" ? true : false,
});