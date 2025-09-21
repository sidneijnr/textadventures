import type { Contexto } from "../contexto.ts";
import type { ItemBase } from "../itens/base.ts";
import { EntidadeBase } from "./base.ts";

export class EntidadeJogador extends EntidadeBase {
    static nome = "JOGADOR";

    outroJogador = true;

    descricao(ctx: Contexto) {
        if(!this.outroJogador) {
            return "Você mesmo.";
        } else {
            return this.entidade.username || "um jogador";
        }
    }

    estaVisivel(): boolean {
        return Date.now() - new Date(this.entidade.atualizadoEm).getTime() <= 1000 * 60 * 10;
    }

    getFilhosVisiveis(): { itens: ItemBase[]; filhos: EntidadeBase[]; } {
        if(!this.outroJogador) {
            return super.getFilhosVisiveis();
        } else {
            return { itens: [], filhos: [] };
        }
    }
}