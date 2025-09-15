import { pgTable, uuid, varchar, jsonb, check, type AnyPgColumn, numeric, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tableEntidades } from './entidadeSchema.js';
import { tableSalas } from './salaSchema.js';
import { type Estado, type EstadoItem } from './estadoSchema.ts';

export const tableItens = pgTable('itens', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Que tipo de item é esse (ex: "espada", "pocao", "chave")
    tipo: varchar('tipo', { length: 100 }).notNull(),

    // Quantidade desse item (para itens empilháveis)
    quantidade: numeric('quantidade', { mode: 'number' }).default(1).notNull(),

    // --- Localização do Item (Apenas um deve ser NÃO NULO) ---

    // Se o item pertence a uma entidade (inventário)
    entidadeId: uuid('entidade_id').references(() => tableEntidades.id, { onDelete: 'restrict' }),

    // Se o item está no chão de uma sala
    salaId: varchar('sala_id', { length: 100 }).references(() => tableSalas.id, { onDelete: 'restrict' }),

    // Se o item está dentro de outro item (container)
    itemContainerId: uuid('item_container_id').references((): AnyPgColumn => tableItens.id, { onDelete: 'restrict' }),

    criadoEm: timestamp('criado_em').defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),

    // Atributos dinâmicos: durabilidade, cargas, etc.
    // Ex: { "durabilidade": 82 }
    estado: jsonb('estado').$type<Estado>().default({}).notNull(),
},
    (table) => [
        check('check_location', sql`num_nonnulls(entidade_id, sala_id, item_container_id) = 1`),
    ]
);

export type Item = typeof tableItens.$inferSelect;