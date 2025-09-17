//-- https://github.com/citusdata/pg_cron

import { sql } from "drizzle-orm";
import type { DatabaseType } from "../drizzle.ts";
import { tableItens } from "../itemSchema.ts";

export class ProcedureResetarItensChao {
    static async create(db: DatabaseType) {
        console.log(await db.execute(sql`
        CREATE OR REPLACE PROCEDURE resetar_itens_chao()
        LANGUAGE plpgsql
        AS $$
        BEGIN
            -- 1. Restaura itens que são spawn (quantidade_inicial) para sua quantidade inicial
            UPDATE itens
            SET quantidade = quantidade_inicial, atualizado_em = NOW()
            WHERE quantidade_inicial IS NOT NULL AND quantidade <> quantidade_inicial AND atualizado_em < NOW() - INTERVAL '2 minutes';

            -- 2. Remove itens que estão no chão há mais de 2 minutos sem atualização, ou que zeraram sua quantidade
            DELETE FROM itens
            WHERE (atualizado_em < NOW() - INTERVAL '2 minutes' AND local_tipo = 'SALA' AND quantidade_inicial IS NULL)
            OR (quantidade < 1);

            COMMIT;
        END;
        $$;
        `));

        //-- Agendar a execução da procedure a cada 5 minutos, 
        //-- Itens que estiverem no chão, a partir de 2 minutos podem ser resetados, sendo 7 minutos o tempo máximo
        // SELECT cron.schedule('limpeza-itens-chao', '*/5 * * * *', 'CALL resetar_itens_chao();');
        console.log(await db.execute(sql`SELECT cron.schedule('limpeza-itens-chao', '*/5 * * * *', 'CALL resetar_itens_chao();')`));
    }

    static async call(db: DatabaseType) {
        return await db.execute(sql`CALL resetar_itens_chao();`);
    }
}