import { pgTable, varchar, jsonb, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { type Estado, type EstadoItem } from './estadoSchema.ts';
import { salas } from '../jogo/salas/salas.ts';
import { getTupleFromKeys } from './utils.ts';

export const enumSalaNome = pgEnum('sala_nome', getTupleFromKeys(salas));

export const tableSalas = pgTable('salas', {
    id: uuid('id').primaryKey().defaultRandom(),
    // ID da sala que corresponde ao seu código (ex: "sala_do_trono")
    nome: enumSalaNome('nome').unique().notNull(),
    
    atualizadoEm: timestamp('atualizado_em', { mode: 'date', withTimezone: true }).defaultNow().notNull(),

    // JSONB para armazenar estados mutáveis da sala
    // Ex: { "porta_trancada": true, "alavanca_puxada": false }
    estado: jsonb('estado').$type<Estado>().default({}).notNull(),
});

export type Sala = typeof tableSalas.$inferSelect;