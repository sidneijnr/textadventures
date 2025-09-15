import z from "zod";

export const respostaSituacao = z.object({
    resposta: z.string().meta({
        example: "Você não pode fazer isso.",
    }),
    jogador: z.object({
        id: z.uuid().meta({
            example: "UUID",
        }),
        salaId: z.string().meta({
            example: "Inicio",
        }),
    })
});