import { type RequestHandler } from "express";
import { itemDocs } from "../docs/itemDocs.ts";
import { ControllerBase } from "./ControllerBase.ts";
import { execArrowOrValue } from "../jogo/types.ts";
import type { SalaBase, SalaBaseStatic } from "../jogo/salas/base.ts";

export class ItemController extends ControllerBase {
    static acaoItem: RequestHandler = async (req, res) => {
        const { ctx, body } = await this.loadRequest(itemDocs["/item/acao"].post.schema, req, res);
        const itemId = body.item;

        // 1. Mochila
        const { itens: mochila, filhos } = ctx.jogador.getFilhosVisiveis();
        let achouObjeto = mochila.find(i => i.item.id === itemId);
        // 1.1 Filhos na mochila
        if(!achouObjeto) {
            for(let filho of filhos) {
                const { itens: mochilaFilho } = filho.getFilhosVisiveis();
                achouObjeto = mochilaFilho.find(i => i.item.id === itemId);
                if(achouObjeto) break;
            }
        }
        // 2. Chão da sala
        if(!achouObjeto) {
            const { itens: itensChao, entidades } = ctx.sala.getFilhosVisiveis();
            achouObjeto = itensChao.find(i => i.item.id === itemId);
            // 2.1 Filhos no chão
            if(!achouObjeto) {
                for(let entidade of entidades) {
                    const { itens: itensEntidade } = entidade.getFilhosVisiveis();
                    achouObjeto = itensEntidade.find(i => i.item.id === itemId);
                    if(achouObjeto) break;
                }
            }
        }
        if(!achouObjeto) {
            ctx.escrevaln("Não tem isso aqui.");
            await this.sendResponse(ctx, req, res);
            return;
        }

        //const acoes = await execCallbackOrValue(itemConfig.acoes ?? {}, ctx, achouObjeto, body.extra ?? null);
        const acoes = await achouObjeto._acoes(ctx, body.extra ?? null);
        if(!(body.acao in acoes) || body.acao.startsWith("$")) {
            ctx.escrevaln("Você não pode fazer isso.");
        } else {
            const result = await execArrowOrValue(acoes[body.acao]);
            if(result) {
                if(typeof result !== "string") {
                    await ctx.moverParaSala(result as typeof SalaBase & SalaBaseStatic);
                } else {
                    ctx.escrevaln(result);
                }
            }
        }

        await this.sendResponse(ctx, req, res);
    }

    /*static pegarItem: RequestHandler = async (req, res) => {
        const { ctx, body } = await this.loadRequest(itemDocs["/item/pegar"].post.schema, req, res);

        let objetos = await ctx.getItensNoChao();
        if (objetos.length == 0) {
            ctx.escrevaln("Não tem nada para pegar.");
        } else {
            const objeto = objetos.find(o => o.id === body.item);
            if (!objeto) {
                ctx.escrevaln("Não tem isso aqui.");
            } else {
                await ctx.moverItem(objeto, { quantidade: body.quantidade, ondeId: ctx.jogador.id });
            }
        }

        await this.sendResponse(ctx, req, res);
    }

    static largarItem: RequestHandler = async (req, res) => {
        const { ctx, body } = await this.loadRequest(itemDocs["/item/largar"].post.schema, req, res);

        let objetos = await ctx.getMochila();
        if (objetos.length == 0) {
            ctx.escrevaln("Não tem nada na mochila.");
        } else {
            const objeto = objetos.find(o => o.id === body.item);
            if (!objeto) {
                ctx.escrevaln("Não tem isso na mochila.");
            } else {
                await ctx.moverItem(objeto, { quantidade: body.quantidade, ondeId: (await ctx.getSala()).id });
            }
        }

        await this.sendResponse(ctx, req, res);
    }*/
}