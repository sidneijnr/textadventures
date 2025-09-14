import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    fullName: text('full_name'),
    phone: varchar('phone', { length: 256 }),
});