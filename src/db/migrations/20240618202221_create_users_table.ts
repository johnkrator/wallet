import type {Knex} from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("name", 255).notNullable();
        table.string("email", 255).notNullable().unique();
        table.string("phone_number", 20).notNullable().unique();
        table.string("password", 255).notNullable();
        table.boolean("is_blacklisted").defaultTo(false);
        table.string("verification_code", 6).nullable();
        table.boolean("is_verified").defaultTo(false);
        table.boolean("is_deleted").defaultTo(false);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("users");
}
