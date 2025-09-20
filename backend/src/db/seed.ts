import "dotenv/config";
import { randomUUID } from "crypto";
import { db } from "./drizzle.ts";
import { type Sala, tableSalas } from "./salaSchema.ts";
import { type Item, tableItens } from "./itemSchema.ts";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { _salas, gerarPilhaId, getSalaConfig } from "../jogo/config.ts";
import type { ItemBase, ItemBaseStatic } from "../jogo/itens/base.ts";

// Assume que acabou de dar drizzle kit push, então as tabelas estão criadas mas vazias
// OU, se já tiver dados, não insere duplicados
try {
    const insertSalas: typeof tableSalas.$inferInsert[] = [];
    const insertItens: typeof tableItens.$inferInsert[] = [];
    _salas.forEach((classe, classeNome) => {
        const salaUUID = randomUUID();
        insertSalas.push({
            id: salaUUID,
            nome: classe.nome,
            estado: classe.estadoInicial?.() || null
        });
    });

    // Atualiza ou insere as salas iniciais
    const todasAsSalas = await db.insert(tableSalas)
        .values(insertSalas)
        .onConflictDoUpdate({
            target: tableSalas.nome,
            set: {
                estado: sql`EXCLUDED.estado`,
                atualizadoEm: sql`NOW()`,
            }
        }).returning({ id: tableSalas.id, nome: tableSalas.nome });

    for(let sala of todasAsSalas) {
        const classe = _salas.get(sala.nome);

        const itensIniciais = classe?.itensIniciais?.() || [];
        
        for(let info of itensIniciais) {
            const item = info.item as typeof ItemBase & ItemBaseStatic;
            const nomeItem = item.nome;
            let estadoInicial = info.estadoInicial || item.estadoInicial?.() || null;
            if(!estadoInicial || Object.keys(estadoInicial).length === 0) {
                estadoInicial = null;
            }

            const pilhaId = gerarPilhaId(nomeItem, estadoInicial);
            insertItens.push({
                nome: nomeItem,
                pilhaId: pilhaId,
                quantidade: info.quantidade,
                quantidadeInicial: info.quantidade,
                ondeId: sala.id,
                estado: estadoInicial
            });
        }
        
    }

    // Deleta todos os itens que estão no chão das salas
    //await db.delete(tableItens).where(eq(tableItens.localTipo, "SALA"));
    // DELETE com join pegando os locais das salas
    const itensNoChao = db.select({ id: tableItens.id })
        .from(tableItens)
        .innerJoin(tableSalas, eq(tableItens.ondeId, tableSalas.id))
        .where(isNotNull(tableSalas.id));

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