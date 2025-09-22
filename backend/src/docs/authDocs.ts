import z from "zod";
import type { DocPaths } from "../utils/docs.ts";
import { authUserSchema, respostaEntidade, respostaSituacao } from "./schemas.ts";

export const authDocs = {
    "/auth/cadastrar": {
        post: {
            summary: "Cadastra um novo usuário",
            description: "Cria um novo usuário com nome de usuário e senha. (Já irá logar o usuário)",
            schema: {
                body: z.object({
                    username: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_\-]+$/).min(3).max(50).meta({
                        description: "Nome de usuário do novo usuário",
                        example: "usuario123",
                    }),
                    password: z.string().min(8).max(255).meta({
                        description: "Senha do novo usuário",
                    }),
                }),
                response: authUserSchema
            }
        }
    },
    "/auth/login": {
        post: {
            summary: "Faz login de um usuário",
            description: "Autentica um usuário com nome de usuário e senha.",
            schema: {
                body: z.object({
                    username: z.string().min(3).max(255).meta({
                        description: "Nome de usuário do usuário",
                        example: "usuario123",
                    }),
                    password: z.string().min(8).max(255).meta({
                        description: "Senha do usuário",
                    }),
                }),
                response: authUserSchema
            }
        }
    },
    "/auth/logout": {
        post: {
            summary: "Faz logout do usuário atual",
            description: "Encerra a sessão do usuário atualmente autenticado.",
        }
    },
    "/auth/info": {
        get: {
            summary: "Informações do usuário autenticado",
            description: "Retorna informações sobre o usuário atualmente autenticado, incluindo detalhes do jogador e estatísticas do jogo.",
            schema: {
                response: z.object({
                    usuario: z.object({
                        username: z.string().meta({
                            description: "Nome de usuário do usuário",
                            example: "usuario123",
                        }),
                        createdAt: z.string().meta({
                            description: "Data de criação do usuário",
                            example: "2023-10-05T14:48:00.000Z",
                        }),
                    }).meta({
                        description: "Informações básicas do usuário",
                    }),
                    jogador: respostaEntidade.omit({ itens: true }).extend({
                        ondeId: z.string().meta({
                            description: "ID da sala onde o jogador está localizado",
                            example: "Inicio",
                        }),
                    }).meta({
                        description: "Detalhes do jogador associado ao usuário",
                    }),
                    usuariosCadastrados: z.number().meta({
                        description: "Número total de usuários cadastrados no sistema",
                        example: 15,
                    }),
                    usuariosOnline: z.number().meta({
                        description: "Número de usuários atualmente online",
                        example: 1,
                    }),
                })
            }
        }
    },
} satisfies DocPaths;