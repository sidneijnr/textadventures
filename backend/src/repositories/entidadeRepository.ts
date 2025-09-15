import { eq } from "drizzle-orm";
import { tableEntidades } from "../db/entidadeSchema.ts";
import { Estado } from "../db/estadoSchema.ts";
import { DatabaseType } from "../db/drizzle.ts";

export class EntidadeRepository {
    static async atualizar(db: DatabaseType, entidadeId: string, dados: { salaId?: string, estado?: Estado } ) {
        await db.update(tableEntidades)
        .set({ 
            salaId: dados.salaId,
            estado: dados.estado,
            atualizadoEm: new Date() 
        })
        .where(eq(tableEntidades.id, entidadeId));
    }
}