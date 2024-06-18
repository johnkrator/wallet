"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.up = up;
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTableIfExists("transactions");
    });
}
exports.down = down;
//# sourceMappingURL=20240618202409_create_transactions_table.js.map