import { pgTable, uuid, varchar, jsonb, check, type AnyPgColumn, timestamp, integer, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tableEntidades } from './entidadeSchema.js';
import { tableSalas } from './salaSchema.js';
import { type Estado, type EstadoItem } from './estadoSchema.ts';
import { itens, type ItemTipo } from '../jogo/itens/itens.ts';
import { getTupleFromKeys } from './utils.ts';

export const enumItemTipo = pgEnum('item_tipo', getTupleFromKeys(itens));

export const tableLocais = pgTable('locais', {
    id: uuid('id').primaryKey().defaultRandom(),
});

export const tableItens = pgTable('itens', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Que tipo de item é esse (ex: "espada", "pocao", "chave")
    tipo: enumItemTipo('tipo').notNull(),

    // Quantidade desse item (para itens empilháveis) Sempre >= 1
    quantidade: integer('quantidade').default(1).notNull(),
    // Quando é um item inicial (spawn) de uma sala. valor que será restaurado.
    quantidadeInicial: integer('quantidade_inicial'),
    
    //localTipo: enumLocalTipo('local_tipo').notNull(),
    //localId: uuid('local_id').notNull(),

    // Onde o item está atualmente
    ondeId: uuid('onde_id').references(() => tableLocais.id, { onDelete: 'restrict' }).notNull(),

    criadoEm: timestamp('criado_em', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em', { mode: 'date', withTimezone: true }).defaultNow().notNull(),

    // Atributos dinâmicos: durabilidade, cargas, etc.
    // Ex: { "durabilidade": 82 }
    estado: jsonb('estado').$type<Estado>().default({}).notNull(),
},
    (table) => [
        // Garante que cada tipo de item esteja em apenas EM UM LUGAR
        uniqueIndex("idx_unico_tipo_onde")
            .on(table.tipo, table.ondeId)
    ]
);

export type Item = typeof tableItens.$inferSelect;