// seed-massivo.ts
import "dotenv/config";
import { randomUUID } from "crypto";
import { db } from "./drizzle.ts";
import { tableSalas } from "./salaSchema.ts";
import { tableUsers } from "./userSchema.ts";
import { tableEntidades } from "./entidadeSchema.ts";
import { tableItens, enumItemTipo, tableLocais } from "./itemSchema.ts";
import bcrypt from "bcryptjs";
import { eq, isNotNull, sql } from "drizzle-orm";
import { faker } from '@faker-js/faker'; // Biblioteca para gerar dados falsos. Instale com: npm i -D @faker-js/faker

// --- Configuração do Seed ---
const CONFIG = {
    NUMERO_DE_JOGADORES: 10000, // Crie 1.000 jogadores
    NUMERO_DE_ITENS_ALEATORIOS: 10000, // Crie 1.000 stacks de itens
    NUMERO_DE_SALAS: 10000, // Crie 1.000 salas
    MAX_QUANTIDADE_POR_ITEM: 1000,
};
// --------------------------

async function seedMassivo() {
    console.log("Iniciando o seed massivo...");
    await db.delete(tableItens).where(isNotNull(tableItens.id));
    await db.delete(tableEntidades).where(isNotNull(tableEntidades.id));
    await db.delete(tableUsers).where(isNotNull(tableUsers.username));
    await db.delete(tableSalas).where(isNotNull(tableSalas.id));
    await db.delete(tableLocais).where(isNotNull(tableLocais.id));


    // --- 1. Criação das Salas Iniciais (Lógica Original Mantida) ---
    // Garante que as salas base do jogo existam.
    console.log("Fase 1: Garantindo a existência das salas base...");
    const insertSalas: (typeof tableSalas.$inferInsert)[] = [];
    for(let i = 0; i < CONFIG.NUMERO_DE_SALAS; i++) {
        const nomeSala = `sala_${i}`;
        
        insertSalas.push({
            nome: nomeSala,
            estado: {}, // Estado inicial vazio
        });
    }

    const todasAsSalas = await db.insert(tableSalas)
        .values(insertSalas)
        .onConflictDoNothing() // Se a sala já existir pelo nome, não faz nada.
        .returning({ 
            id: tableSalas.id, 
            nome: tableSalas.nome, 
            localId: tableSalas.localId 
        });
    
    console.log(`${todasAsSalas.length} salas carregadas.`);

    // --- 2. Geração de Usuários e Entidades de Jogadores em Massa ---
    console.log(`Fase 2: Gerando ${CONFIG.NUMERO_DE_JOGADORES} usuários e entidades...`);
    const insertUsuarios: (typeof tableUsers.$inferInsert)[] = [];
    const insertEntidadesJogadores: (typeof tableEntidades.$inferInsert)[] = [];
    const passwordHash = await bcrypt.hash("12345678", 10);

    for (let i = 0; i < CONFIG.NUMERO_DE_JOGADORES; i++) {
        const username = faker.internet.username().toLowerCase() + `_${i}`;
        // Pega uma sala aleatória para o jogador começar
        const salaInicial = todasAsSalas[Math.floor(Math.random() * todasAsSalas.length)];

        insertUsuarios.push({
            username,
            passwordHash,
        });

        insertEntidadesJogadores.push({
            categoria: 'JOGADOR',
            tipo: 'JOGADOR',
            username,
            salaId: salaInicial.id
        });
    }

    // Inserção em massa (muito mais rápido que um por um)
    await db.insert(tableUsers).values(insertUsuarios).onConflictDoNothing();
    await db.insert(tableEntidades).values(insertEntidadesJogadores).onConflictDoNothing();

    console.log("Usuários e entidades de jogadores criados.");

    // --- 3. Geração de Itens Aleatórios em Massa ---
    console.log(`Fase 3: Gerando ${CONFIG.NUMERO_DE_ITENS_ALEATORIOS} itens aleatórios...`);

    // Precisamos de todos os `localId`s disponíveis (de salas e de entidades)
    const locaisDeSalas = todasAsSalas.map(s => s.localId);
    
    const locaisDeEntidades = await db.select({ localId: tableEntidades.localId })
        .from(tableEntidades);

    const todosOsLocais = [...locaisDeSalas, ...locaisDeEntidades.map(e => e.localId)];
    const todosOsTiposDeItens = enumItemTipo.enumValues;
    
    const insertItens: (typeof tableItens.$inferInsert)[] = [];

    for (let i = 0; i < CONFIG.NUMERO_DE_ITENS_ALEATORIOS; i++) {
        const ondeId = todosOsLocais[Math.floor(Math.random() * todosOsLocais.length)];
        const tipo = todosOsTiposDeItens[Math.floor(Math.random() * todosOsTiposDeItens.length)];
        const quantidade = Math.floor(Math.random() * CONFIG.MAX_QUANTIDADE_POR_ITEM) + 1;

        insertItens.push({
            tipo,
            ondeId,
            quantidade
        });
    }

    // Inserção em massa com tratamento de conflitos
    // Se tentarmos inserir um item de um tipo que já existe em um local,
    // ele irá somar a quantidade em vez de dar erro.
    await db.insert(tableItens)
        .values(insertItens)
        .onConflictDoNothing();

    console.log("Itens aleatórios criados e distribuídos.");
    console.log("Seed massivo concluído com sucesso!");
}

seedMassivo().catch(error => {
    console.error("Erro durante o seed massivo:", error);
    process.exit(1);
}).finally(async () => {
    await db.$client.end();
});