import express from "express";
import { db } from "../db/drizzle.ts";
import { tableUsers } from "../db/userSchema.ts";
import { onLinha } from "../jogo/principal.ts";
import { apiDocPaths } from "../docs/head.ts";
import { parseRequest } from "../utils/docs.ts";

export const getLinhaRouter = () => {
    const router = express.Router();
    
    router.post("/linha", async (req, res) => {
        const { body } = parseRequest(apiDocPaths["/linha"].post.schema, req);

        // A FAZER: obter sessão do usuário.
        const userInfo = await db.select().from(tableUsers).limit(1);
        if(!userInfo || userInfo.length === 0 || !userInfo[0]) {
            res.status(401).json({ error: "Usuário não encontrado" });
            return;
        }

        const result = await onLinha(body.texto, userInfo[0]);

        res.json({ 
            resposta: result
        });
    });
    
    return router;
};