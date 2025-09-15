import { eq } from "drizzle-orm";
import { type Item, tableItens } from "../db/itemSchema.ts";
import { type DatabaseType } from "../db/drizzle.ts";

export class ItemRepository {
    static async naMochila(db: DatabaseType, entidadeId: string): Promise<Item[]> {
        const itens = await db.select()
            .from(tableItens)
            .where(eq(tableItens.entidadeId, entidadeId));
        return itens;
    }

    static async noChao(db: DatabaseType, salaId: string): Promise<Item[]> {
        const itens = await db.select()
            .from(tableItens)
            .where(eq(tableItens.salaId, salaId));
        return itens;
    }

    static async moverItem(db: DatabaseType, itemId: string, onde: { entidadeId?: string } | { salaId?: string } | { itemContainerId?: string }) {
        await db.update(tableItens)
        .set({ 
            entidadeId: "entidadeId" in onde && onde.entidadeId || null,
            salaId: "salaId" in onde && onde.salaId || null,
            itemContainerId: "itemContainerId" in onde && onde.itemContainerId || null,
            atualizadoEm: new Date() 
        })
        .where(eq(tableItens.id, itemId));
    }
}