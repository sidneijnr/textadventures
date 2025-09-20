import type { Sala } from "../../db/salaSchema.ts";
import type { Contexto } from "../contexto.ts";
import type { EntidadeBase } from "../entidades/base.ts";
import type { ItemBase } from "../itens/base.ts";
import type { ArrowOrValue, Estado, MaybePromise } from "../types.ts";

export type ItemInicial = {
    item: typeof ItemBase;
    quantidade: number;
    estadoInicial?: Estado;
};

export interface SalaBaseStatic {
    nome: string;
    itensIniciais?: () => ItemInicial[];
    estadoInicial?: () => Estado;
}


export type AcoesCallbackResult = {
    [acao: string]: ArrowOrValue<typeof SalaBase & SalaBaseStatic | string | void>;
};

export abstract class SalaBase {    
    descricao(ctx: Contexto): MaybePromise<string | void> {
        return;
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

    sala: Sala;
    itens: ItemBase[];
    entidades: EntidadeBase[];

    constructor(info: {sala: Sala, itens?: ItemBase[], entidades?: EntidadeBase[]}) {
        this.sala = info.sala;
        this.itens = info.itens || [];
        this.entidades = info.entidades || [];
    }

    temLuz(): boolean {
        return true;
        /*const sala = await this.getSala();
        if(sala.estado?.luz === true) return true;

        let chao = await this.getItensNoChao();
        for(let obj of chao) {
            if(obj.estado?.luz === true) return true;
        }

        let mochila = await this.getMochila();
        for(let obj of mochila) {
            if(obj.estado?.luz === true) return true;
        }

        let entidades = await this.getEntidadesNaSala();
        for(let ent of entidades) {
            if(ent.estado?.luz === true) return true;
            for(let obj of ent.mochila) {
                if(obj.estado?.luz === true) return true;
            }
        }

        return false;*/
    }
};

export class SalaGlobal extends SalaBase {
    static nome = "Global";
    descricao(ctx: Contexto) {
        return "";
    }
}