import z from "zod";
import { type DocPaths } from "../utils/docs.ts";
import { acaoExtraSchema, respostaSituacao } from "./schemas.ts";
import { Acao } from "../jogo/comandos/comandoConfig.ts";

export const salaDocs = {
    "/sala/{salaId}/olhar": {
        get: {
            summary: "Descreve a sala atual",
            description: "Retorna a descrição completa da sala onde o jogador se encontra, incluindo saídas, itens no chão e outras entidades visíveis.",
            schema: {
                params: z.object({
                    salaId: z.uuid().meta({
                        description: "ID da sala com a qual realizar a ação",
                        example: "UUID",
                    })
                }),
                response: respostaSituacao
            }
        }
    },
    "/sala/{salaId}/{acao}": {
        post: {
            summary: "Faz uma ação na sala",
            description: "Tenta mover o jogador para uma sala adjacente na direção especificada (ex: n, s, l, o).",
            schema: {
                params: z.object({
                    salaId: z.uuid().meta({
                        description: "ID da sala com a qual realizar a ação",
                        example: "UUID",
                    }),
                    acao: z.preprocess((s) => typeof s === "string" ? s.toUpperCase() : s, z.enum(Acao).meta({
                        description: "Ação a ser realizada",
                        example: "n",
                    })),
                }),
                body: acaoExtraSchema.optional(),
                response: respostaSituacao
            }
        }
    }
} satisfies DocPaths;