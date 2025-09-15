import z from "zod";
import { DocPaths } from "../utils/docs.ts";

export const linhaDocs = {
    "/linha": {
        post: {
            summary: "Envia um comando para o jogo",
            description: "Envia um comando para o jogo e recebe a resposta.",
            schema: {
                body: z.object({
                    texto: z.string().max(500).meta({
                        description: "Comando de texto a ser processado pelo jogo",
                        example: "olhar",
                    }),
                }),
                response: z.object({
                    resposta: z.string().meta({
                        example: "Você está em uma sala escura. Há uma porta ao norte.",
                    }),
                })
            }
        }
    }
} satisfies DocPaths;