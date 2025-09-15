import { pgTable, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { type Estado, type EstadoItem } from './estadoSchema.ts';

export const tableSalas = pgTable('salas', {
    // ID da sala que corresponde ao seu código (ex: "sala_do_trono")
    id: varchar('id', { length: 100 }).primaryKey(),
    
    atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),

    // JSONB para armazenar estados mutáveis da sala
    // Ex: { "porta_trancada": true, "alavanca_puxada": false }
    estado: jsonb('estado').$type<Estado>().default({}).notNull(),
});

export type Sala = typeof tableSalas.$inferSelect;