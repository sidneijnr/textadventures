import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { type Sala, tableSalas } from "../db/salaSchema.ts";
import { alias } from "drizzle-orm/pg-core";
import { type Entidade, tableEntidades } from "../db/entidadeSchema.ts";
import { type Estado } from "../db/estadoSchema.ts";
import { type Item, tableItens, tableLocais } from "../db/itemSchema.ts";
import { type DatabaseType } from "../db/drizzle.ts";
import { RevokeSessionError } from "../middlewares/authMiddleware.ts";
import { mapArrayWithTable } from "../db/utils.ts";
import type { SalaNome } from "../jogo/salas/salas.ts";

export class SalaRepository {
    static async dadosIniciaisJogador(db: DatabaseType, username: string) {
        const [resultGlobal, result] = await Promise.all([
            db.select().from(tableSalas).where(eq(tableSalas.nome, "Global")).limit(1),
            db.query.tableEntidades.findFirst({
                where: eq(tableEntidades.username, username),
                with: {
                    sala: {
                        with: {
                            itens: true,
                            entidades: true
                        }
                    },
                    mochila: true
                }
            })
        ]);
            
        if(!result) {
            throw new RevokeSessionError("Usuário não existe!");
        }

        const { sala: _sala, mochila, ...entidade } = result;
        const { itens, entidades, ...sala } = _sala;
            
        if(!entidade || !sala) {
            throw new RevokeSessionError("Entidade em sala que não existe!");
        }

        return { 
            jogador: entidade, 
            sala: sala, 
            global: resultGlobal[0], 
            itensNoChao: itens.filter(i => i.quantidade > 0),
            mochila: mochila.filter(i => i.quantidade > 0),
            entidadesNaSala: entidades,
        };
    }

    static async getSalaById(db: DatabaseType, salaId: string): Promise<Sala | null> {
        const result = await db.select()
        .from(tableSalas)
        .where(eq(tableSalas.id, salaId))
        .limit(1);

        return result && result.length > 0 ? result[0] : null;
    }

    static async getSalaByNome(db: DatabaseType, sala: SalaNome): Promise<Sala | null> {
        const result = await db.select()
        .from(tableSalas)
        .where(eq(tableSalas.nome, sala))
        .limit(1);

        return result && result.length > 0 ? result[0] : null;
    }

    static async atualizar(db: DatabaseType, salaId: string, dados: { estado: Estado } ) {
        await db.update(tableSalas)
        .set({ 
            estado: dados.estado,
            atualizadoEm: sql<Date>`NOW()`, 
        })
        .where(eq(tableSalas.id, salaId));
    }
}