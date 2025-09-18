import { pgTable, varchar, jsonb, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { type Estado, type EstadoItem } from './estadoSchema.ts';
import { salas } from '../jogo/salas/salas.ts';
import { getTupleFromKeys, UUID_ZERO } from './utils.ts';
import { tableLocais } from './itemSchema.ts';

export const enumSalaNome = pgEnum('sala_nome', getTupleFromKeys(salas));

export const tableSalas = pgTable('salas', {
    id: uuid('id').primaryKey().defaultRandom(),
    // ID da sala que corresponde ao seu código (ex: "sala_do_trono")
    nome: enumSalaNome('nome').unique().notNull(),
    
    atualizadoEm: timestamp('atualizado_em', { mode: 'date', withTimezone: true }).defaultNow().notNull(),

    // Referência para o local para itens associado a esta entidade, criado pela trigger criar_local_automatico.
    localId: uuid('local_id').references(() => tableLocais.id, { onDelete: 'restrict' }).$defaultFn(() => UUID_ZERO).unique().notNull(),

    // JSONB para armazenar estados mutáveis da sala
    // Ex: { "porta_trancada": true, "alavanca_puxada": false }
    estado: jsonb('estado').$type<Estado>().default({}).notNull(),
});

export type Sala = typeof tableSalas.$inferSelect;