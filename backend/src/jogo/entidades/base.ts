import type { Entidade } from "../../db/entidadeSchema.ts";
import type { Item } from "../../db/itemSchema.ts";
import type { Contexto } from "../contexto.ts";
import type { ItemBase, ItemBaseStatic } from "../itens/base.ts";
import { SalaBase, type AcoesCallbackResult, type ItemInicial, type SalaBaseStatic } from "../salas/base.ts";
import type { ArrowOrValue, Estado, MaybePromise } from "../types.ts";

export type EntidadeInicial = {
    entidade: typeof EntidadeBase & EntidadeBaseStatic;
    itensIniciais?: ItemInicial[];
    filhosIniciais?: EntidadeInicial[];
    estadoInicial?: Estado;
    ref?: { sala: typeof SalaBase & SalaBaseStatic }; // Quando for entidade ref. Procura a entidade do tipo na sala indicada.
};

export interface EntidadeBaseStatic {
    nome: string;
    itensIniciais?: () => ItemInicial[];
    filhosIniciais?: () => EntidadeInicial[];
    estadoInicial?: () => Estado;
}

export abstract class EntidadeBase {    
    descricao(ctx: Contexto): MaybePromise<string | void> {
        return `um ${this.entidade.tipo.toLowerCase()}`;
    }
    acoes(ctx: Contexto, extra?: Estado | null): MaybePromise<AcoesCallbackResult> {
        return {};
    }
    async _acoes(ctx: Contexto, extra?: Estado | null): Promise<AcoesCallbackResult> {
        return {
            "$DESCRICAO": async () => await this.descricao(ctx),
            ...(await this.acoes(ctx, extra))
        };
    }

    entidade: Entidade
    onde: SalaBase | EntidadeBase;
    itens: ItemBase[];
    filhos: EntidadeBase[];
    ehReferencia: boolean = false;

    constructor(info: {entidade: Entidade, onde: SalaBase | EntidadeBase, itens?: ItemBase[], filhos?: EntidadeBase[]}) {
        this.entidade = info.entidade;
        this.onde = info.onde;
        this.itens = info.itens || [];
        this.filhos = info.filhos || [];
    }

    obterItensPorNome(item: typeof ItemBase & ItemBaseStatic): ItemBase[] {
        return this.itens.filter(i => i.item.nome === item.nome);
    }

    temLuz(): boolean {
        if(this.entidade.estado?.luz === true) return true;

        for(let obj of this.itens) {
            if(obj.temLuz()) return true;
        }

        for(let ent of this.filhos) {
            if(ent.temLuz()) return true;
        }

        return false;
    }

    estaVisivel() {
        return true;
    }

    getFilhosVisiveis() {
        return {
            itens: this.itens.filter(i => i.estaVisivel()),
            filhos: this.filhos.filter(e => e.estaVisivel())
        };
    }
}