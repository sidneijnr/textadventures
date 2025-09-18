import "dotenv/config";
import { randomUUID } from "crypto";
import { db } from "./drizzle.ts";
import { type Sala, tableSalas } from "./salaSchema.ts";
import { tableUsers } from "./userSchema.ts";
import { tableEntidades } from "./entidadeSchema.ts";
import { type Item, tableItens } from "./itemSchema.ts";
import { salas, type SalaNome } from "../jogo/salas/salas.ts";
import bcrypt from "bcryptjs";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { ProcedureResetarItensChao } from "./procedures/resetarItensChao.ts";

// Assume que acabou de dar drizzle kit push, então as tabelas estão criadas mas vazias
// OU, se já tiver dados, não insere duplicados
try {

    const insertSalas: typeof tableSalas.$inferInsert[] = [];
    const insertItens: typeof tableItens.$inferInsert[] = [];
    for(let [salaNome, sala] of Object.entries(salas)) {
        const salaUUID = randomUUID();
        insertSalas.push({
            id: salaUUID,
            nome: salaNome as SalaNome,
            estado: sala.estadoInicial || {}
        });
    }

    // Atualiza ou insere as salas iniciais
    const todasAsSalas = await db.insert(tableSalas)
        .values(insertSalas)
        .onConflictDoUpdate({
            target: tableSalas.nome,
            set: {
                estado: sql`EXCLUDED.estado`,
                atualizadoEm: sql`NOW()`,
            }
        }).returning({ id: tableSalas.id, nome: tableSalas.nome, localId: tableSalas.localId });

    for(let sala of todasAsSalas) {
        const configSala = salas[sala.nome as keyof typeof salas];
        if(!configSala) continue;

        if(configSala.itensIniciais) {
            for(let item of configSala.itensIniciais) {
                insertItens.push({
                    id: randomUUID(),
                    tipo: item.tipo,
                    quantidade: item.quantidade,
                    quantidadeInicial: item.quantidade,
                    ondeId: sala.localId,
                    estado: item.estadoInicial || {}
                });
            }
        }
    }

    // Deleta todos os itens que estão no chão das salas
    //await db.delete(tableItens).where(eq(tableItens.localTipo, "SALA"));
    // DELETE com join pegando os locais das salas
    const itensNoChao = db.select({ id: tableItens.id })
        .from(tableItens)
        .innerJoin(tableSalas, eq(tableItens.ondeId, tableSalas.localId))
        .where(isNotNull(tableSalas.localId));

    await db.delete(tableItens).where(
        inArray(tableItens.id, itensNoChao)
    );

    // Re-insere os itens iniciais no chão das salas
    await db.insert(tableItens).values(insertItens);
    
    console.log("Seed inicial criado!");
} catch (error) {
    console.error("Erro:", error);
} finally {
    await db.$client.end();
}