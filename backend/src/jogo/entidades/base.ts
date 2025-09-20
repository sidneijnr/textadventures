import type { Entidade } from "../../db/entidadeSchema.ts";
import type { Item } from "../../db/itemSchema.ts";
import type { Contexto } from "../contexto.ts";
import type { ItemBase } from "../itens/base.ts";
import type { AcoesCallbackResult, SalaBase } from "../salas/base.ts";
import type { ArrowOrValue, Estado, MaybePromise } from "../types.ts";

export interface EntidadeBaseStatic {
    nome: string;
    estadoInicial?: () => Estado;
}

export abstract class EntidadeBase {    
    descricao(ctx: Contexto): MaybePromise<string | void> {
        return;
    }
    acoes(ctx: Contexto, extra?: Estado | null): MaybePromise<AcoesCallbackResult> {
        return {};
    }
    async _acoes(ctx: Contexto, extra?: Estado | null): Promise<AcoesCallbackResult> {
        return {
            "$DESCRICAO": async () => await this.descricao(ctx),
            "FALAR": () => "Não há ninguém aqui para ouvir você.",
            ...(await this.acoes(ctx, extra))
        };
    }

    entidade: Entidade
    onde: SalaBase | EntidadeBase;
    itens: ItemBase[];
    filhos: EntidadeBase[];

    constructor(info: {entidade: Entidade, onde: SalaBase | EntidadeBase, itens?: ItemBase[], filhos?: EntidadeBase[]}) {
        this.entidade = info.entidade;
        this.onde = info.onde;
        this.itens = info.itens || [];
        this.filhos = info.filhos || [];
    }
}