import { type RequestHandler } from "express";
import { salaDocs } from "../docs/salaDocs.ts";
import { ControllerBase } from "./ControllerBase.ts";
import { execArrowOrValue } from "../jogo/types.ts";
import { SalaBase, type SalaBaseStatic } from "../jogo/salas/base.ts";

export class SalaController extends ControllerBase {
    static descreverSalaAtual: RequestHandler = async (req, res) => {
        const { ctx } = await this.loadRequest(salaDocs["/sala/olhar"].get.schema, req, res);

        await this.sendResponse(ctx, req, res);
    }

    static executarAcao: RequestHandler = async (req, res) => {
        const { ctx, body } = await this.loadRequest(salaDocs["/sala/acao"].post.schema, req, res);

        const sala = ctx.sala;
        const acoes = await sala._acoes(ctx, body.extra ?? null);
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