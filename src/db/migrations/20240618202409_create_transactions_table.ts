import type {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("transactions", (table) => {
        table.increments("id").primary();
        table.integer("wallet_id").unsigned().notNullable();
        table.foreign("wallet_id").references("id").inTable("wallets").onDelete("CASCADE");
        table.enu("type", ["deposit", "transfer", "withdrawal"]).notNullable();
        table.decimal("amount", 10, 2).notNullable();
        table.timestamp("timestamp").defaultTo(knex.fn.now());
        table.enu("status", ["pending", "successful", "failed"]).notNullable();
        table.integer("recipient_wallet_id").unsigned().nullable();
        table.foreign("recipient_wallet_id").references("id").inTable("wallets");
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("transactions");
}
