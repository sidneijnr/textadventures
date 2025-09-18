import { type RequestHandler } from "express";
import { Contexto } from "../jogo/contexto.ts";
import { parseRequest } from "../utils/docs.ts";
import { itemDocs } from "../docs/itemDocs.ts";
import type { User } from "../db/userSchema.ts";

export class ItemController {
    static pegarItem: RequestHandler = async (req, res) => {
        const usuario = req.session! as User;
        const { body } = parseRequest(itemDocs["/item/pegar"].post.schema, req);

        const ctx = await Contexto.carregar(usuario.username);

        let objetos = await ctx.getItensNoChao();
        if (objetos.length == 0) {
            ctx.escrevaln("Não tem nada para pegar.");
        } else {
            const objeto = objetos.find(o => o.id === body.item);
            if (!objeto) {
                ctx.escrevaln("Não tem isso aqui.");
            } else {
                await ctx.moverItem(objeto, body.quantidade, ctx.jogador);
            }
        }

        const result = await ctx.retornarSituacao();
        await ctx.salvar();

        res.json(result);
    }

    static largarItem: RequestHandler = async (req, res) => {
        const usuario = req.session! as User;
        const { body } = parseRequest(itemDocs["/item/largar"].post.schema, req);

        const ctx = await Contexto.carregar(usuario.username);

        let objetos = await ctx.getMochila();
        if (objetos.length == 0) {
            ctx.escrevaln("Não tem nada na mochila.");
        } else {
            const objeto = objetos.find(o => o.id === body.item);
            if (!objeto) {
                ctx.escrevaln("Não tem isso na mochila.");
            } else {
                await ctx.moverItem(objeto, body.quantidade, await ctx.getSala());
            }
        }

        const result = await ctx.retornarSituacao();
        await ctx.salvar();

        res.json(result);
    }
}