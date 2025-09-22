import { and, eq, isNotNull, sql } from "drizzle-orm";
import type { DatabaseType } from "../db/drizzle.ts";
import { tableUsers, type User } from "../db/userSchema.ts";
import { tableEntidades } from "../db/entidadeSchema.ts";
import { tableSalas } from "../db/salaSchema.ts";
import { alias } from "drizzle-orm/pg-core";

export class UserRepository {
    static async buscarUsername(db: DatabaseType, username: string) {
        const result = await db.select()
            .from(tableUsers)
            .where(eq(tableUsers.username, username))
            .limit(1);

        return result.length >= 0 ? result[0] : null;
    }

    static async cadastrarUsuario(db: DatabaseType, dados: { username: string, passwordHash: string }) {
        const result = await db.transaction(async (tx) => {
            const resultUser = await tx.insert(tableUsers).values({
                username: dados.username,
                passwordHash: dados.passwordHash
            }).returning();

            const [salaInicial] = await tx.select()
                .from(tableSalas)
                .where(eq(tableSalas.nome, "Inicio"));

            const resultEntity = await tx.insert(tableEntidades).values({
                username: dados.username,
                tipo: "JOGADOR",
                ondeId: salaInicial.id,
                estado: { vivo: 1 },
                criadoEm: sql<Date>`NOW()`,
                atualizadoEm: sql<Date>`NOW()`,
            }).returning();

            return {
                user: resultUser[0],
                entidade: resultEntity[0]
            };
        });

        return result;
    }

    static async jogoInfo(db: DatabaseType, username: string) {
        const totalUsuariosSubquery = db
            .select({
                username1: sql<string>`${username}`.as('username1'),
                count: sql<number>`count(*)::int`.as('total_usuarios'),
            })
            .from(tableUsers)
            .as('total_usuarios_sq');

        const usuariosAtivosSubquery = db
            .select({
                username2: sql<string>`${username}`.as('username2'),
                count: sql<number>`count(*)::int`.as('usuarios_ativos'),
            })
            .from(tableEntidades)
            .where(and(isNotNull(tableEntidades.username), sql`${tableEntidades.atualizadoEm} >= NOW() - INTERVAL '10 minutes'`))
            .as('usuarios_ativos_sq');

        const resultado = await db
            .select({
                usuario: { 
                    username: tableUsers.username,
                    createdAt: tableUsers.createdAt,
                },
                entidade: {
                    id: tableEntidades.id,
                    nome: tableEntidades.nome,
                    username: tableEntidades.username,
                    tipo: tableEntidades.tipo,
                    ondeId: tableEntidades.ondeId,
                    criadoEm: tableEntidades.criadoEm,
                    atualizadoEm: tableEntidades.atualizadoEm
                },
                usuariosCadastrados: totalUsuariosSubquery.count,
                usuariosOnline: usuariosAtivosSubquery.count,
            })
            .from(tableUsers)
            .innerJoin(tableEntidades, and(isNotNull(tableEntidades.username), eq(tableEntidades.username, username)))
            .leftJoin(totalUsuariosSubquery, eq(totalUsuariosSubquery.username1, tableUsers.username))
            .leftJoin(usuariosAtivosSubquery, eq(usuariosAtivosSubquery.username2, tableUsers.username))
            .where(eq(tableUsers.username, username))
            .limit(1);

        if (resultado.length === 0) {
            return null;
        }

        return resultado[0];
    }
}