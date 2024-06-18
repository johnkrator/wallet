import type {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("wallets", (table) => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().notNullable().unique();
        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.decimal("balance", 10, 2).defaultTo(0.00);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("wallets");
}
