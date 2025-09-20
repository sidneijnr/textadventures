import type { Contexto } from "../contexto.ts";
import { EntidadeBase } from "./base.ts";

export class EntidadeJogador extends EntidadeBase {
    static nome = "JOGADOR";
    descricao(ctx: Contexto) {
        if(this.entidade.id === ctx.jogador.entidade.id) {
            return "Você mesmo.";
        } else if(this.entidade.tipo === "JOGADOR") {
            return this.entidade.username || "um jogador";
        } else {
            return `um ${this.entidade.tipo.toLowerCase()}`;
        }
    }
}