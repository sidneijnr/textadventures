import z from "zod";
import { type DocPaths } from "../utils/docs.ts";
import { acaoExtraSchema, respostaSituacao } from "./schemas.ts";
import { Acao } from "../jogo/comandos/comandoConfig.ts";

export const itemDocs = {
    "/item/{id}/{acao}": {
        post: {
            summary: "Realiza uma ação com um item",
            description: "Realiza uma ação específica com um item que está na mochila ou no chão",
            schema: {
                params: z.object({
                    id: z.uuid().meta({
                        description: "ID do item com a qual realizar a ação",
                        example: "UUID",
                    }),
                    acao: z.preprocess((s) => typeof s === "string" ? s.toUpperCase() : s, z.enum(Acao).meta({
                        description: "Ação a ser realizada",
                        example: "pegar",
                    })),
                }),
                body: acaoExtraSchema.optional(),
                response: respostaSituacao
            }
        }
    }
} satisfies DocPaths;