import { eq } from "drizzle-orm";
import { db } from "../config/drizzle.ts";
import { tableEntidades } from "../db/entidadeSchema.ts";
import { tableSalas } from "../db/salaSchema.ts";
import { tableItens } from "../db/itemSchema.ts";
import { alias } from "drizzle-orm/pg-core";
import { Contexto, salas } from "./salas/salas.ts";
import { gerarEscreva } from "../utils/escreva.ts";

/**
 * Como só tem 1 rota, é necessário obter a situação atual do usuário parar aplicar o comando
 * Ou seja, todo comando que o usuário faz vai passar por aqui.
 */
export const onLinha = async (texto: string, usuario: {id: string}): Promise<string> => {
    let resp = { str: "" };
    // 1. Obter a situação atual do usuário e do jogo:
    // - Obter usuário: Em qual sala está? Pode realizar ações? Que itens possui?
    // - Obter sala: Qual a situação da sala nesse momento? Quais itens estão no chão? Quais entidades estão presentes?
    // - Obter entidades: Qual a situação delas?
    // - Obter itens: Qual a situação deles?

    const aliasSalaGlobal = alias(tableSalas, "global");
    const result = await db.select({
            sala: tableSalas,
            entidade: tableEntidades,
            global: aliasSalaGlobal
        })
        .from(tableEntidades)
        .leftJoin(tableSalas, eq(tableEntidades.salaId, tableSalas.id))
        .leftJoin(aliasSalaGlobal, eq(aliasSalaGlobal.id, "Global"))
        .where(eq(tableEntidades.usuarioId, usuario.id))
        .limit(1);

    if(!result || result.length === 0 || !result[0]) {
        throw new Error("Usuário não existe!");
    }

    const { entidade, sala, global } = result[0];
    if(!entidade || !sala || !global) {
        throw new Error("Entidade em sala que não existe!");
    }

    let salaConfig = salas[sala.id];
    if(!salaConfig) {
        throw new Error(`Sala com id ${sala.id} não existe na configuração do jogo!`);
    }

    // Depois, colocar aqui funções que podem ser chamadas pelos scripts do jogo para alterar as coisas,
    // em vez de modificar o contexto diretamente.
    const ctx: Contexto = {
        jogador: {
            ...entidade,
            estado: JSON.parse(JSON.stringify(entidade.estado))
        },
        sala: {
            ...sala,
            estado: JSON.parse(JSON.stringify(sala.estado))
        },
        global: {
            ...global,
            estado: JSON.parse(JSON.stringify(global.estado))
        },
        escreva: gerarEscreva(resp)
    };
    
    // 2. Processar o comando, aplicando as regras do jogo, e atualizando a situação do usuário e do jogo no banco de dados.
    // - Verificar se o comando é válido no contexto atual
    // - Atualizar a situação do usuário e do jogo no banco de dados
    // - Gerar a resposta do jogo ao comando, Mensagens de erro ou sucesso, se aplicável
    const comando = texto.trim().toUpperCase();

    // A FAZER: processar isso melhor kk
    if(!comando || comando === "OLHAR") {
        // Apenas olhar ao redor
        const descr = await salaConfig.descricao(ctx);
        if(descr) {
            ctx.escreva(descr, "\n");
        }
        for(const conexao of Object.keys(salaConfig.conexoes)) {
            ctx.escreva(`- ${conexao}`, "\n");
        }
    } else {
        const conexao = comando in salaConfig.conexoes && salaConfig.conexoes[comando];
        if(!conexao) {
            ctx.escreva("Você não pode ir por aí.\n");
        } else {
            const novaSalaId = await conexao(ctx);
            if(novaSalaId) {
                ctx.jogador.salaId = novaSalaId;
            }
        }
    }

    if(ctx.jogador.salaId !== entidade.salaId) {
        const result = await db.select({
            sala: tableSalas
        })
        .from(tableSalas)
        .where(eq(tableSalas.id, ctx.jogador.salaId))
        .limit(1);

        if(!result || result.length === 0 || !result[0] || !result[0].sala) {
            throw new Error("Sala para onde o jogador tentou ir não existe!");
        }

        const { sala: novaSala } = result[0];
        let salaConfig = salas[novaSala.id];
        if(!salaConfig) {
            throw new Error(`Sala com id ${novaSala.id} não existe na configuração do jogo!`);
        }

        ctx.sala = JSON.parse(JSON.stringify(novaSala));
        const descr = await salaConfig.descricao(ctx);
        if(descr) {
            ctx.escreva(descr, "\n");
        }
        for(const conexao of Object.keys(salaConfig.conexoes)) {
            ctx.escreva(`- ${conexao}`, "\n");
        }
    }

    // 4. Atualizar o banco de dados com a nova situação do usuário e do jogo
    if(ctx.jogador.salaId !== entidade.salaId || JSON.stringify(ctx.jogador.estado) !== JSON.stringify(entidade.estado)) {
        await db.update(tableEntidades)
            .set({ 
                salaId: ctx.jogador.salaId, 
                estado: ctx.jogador.estado,
                atualizadoEm: new Date() 
            })
            .where(eq(tableEntidades.id, ctx.jogador.id));
    }

    if(JSON.stringify(ctx.sala.estado) !== JSON.stringify(sala.estado)) {
        await db.update(tableSalas)
            .set({ 
                estado: ctx.sala.estado,
                atualizadoEm: new Date() 
            })
            .where(eq(tableSalas.id, ctx.sala.id));
    }

    if(JSON.stringify(ctx.global.estado) !== JSON.stringify(global.estado)) {
        await db.update(tableSalas)
            .set({
                estado: ctx.global.estado,
                atualizadoEm: new Date() 
            })
            .where(eq(tableSalas.id, ctx.global.id));
    }

    return resp.str;
};