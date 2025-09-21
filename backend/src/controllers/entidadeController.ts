import { type RequestHandler } from "express";
import { ControllerBase } from "./ControllerBase.ts";
import { execArrowOrValue } from "../jogo/types.ts";
import type { SalaBase, SalaBaseStatic } from "../jogo/salas/base.ts";
import { entidadeDocs } from "../docs/entidadeDocs.ts";

export class EntidadeController extends ControllerBase {
    static acaoEntidade: RequestHandler = async (req, res) => {
        const { ctx, body } = await this.loadRequest(entidadeDocs["/entidade/acao"].post.schema, req, res);
        const entidadeId = body.entidade;
        
        // 1 Filhos na mochila (Não implementado sempre vazio...)
        const { filhos } = ctx.jogador.getFilhosVisiveis();
        let achouEntidade = filhos.find(i => i.entidade.id === entidadeId);
        
        // 2. Na sala
        if(!achouEntidade) {
            const { entidades } = ctx.sala.getFilhosVisiveis();
            achouEntidade = entidades.find(i => i.entidade.id === entidadeId);
            // 2.1 Filhos da entidade (Não implementado sempre vazio...)
            if(!achouEntidade) {
                for(let entidade of entidades) {
                    const { filhos: entidadeFilhos } = entidade.getFilhosVisiveis();
                    achouEntidade = entidadeFilhos.find(i => i.entidade.id === entidadeId);
                    if(achouEntidade) break;
                }
            }
        }

        if(!achouEntidade) {
            ctx.escrevaln("Não tem isso aqui.");
            await this.sendResponse(ctx, req, res);
            return;
        }

        //const acoes = await execCallbackOrValue(itemConfig.acoes ?? {}, ctx, achouObjeto, body.extra ?? null);
        const acoes = await achouEntidade._acoes(ctx, body.extra ?? null);
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
}