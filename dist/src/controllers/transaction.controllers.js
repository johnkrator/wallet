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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundWallet = void 0;
const db_1 = __importDefault(require("../db/db"));
const fundWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const trx = yield db_1.default.transaction();
    try {
        // Fetch the user's wallet
        const wallet = yield trx("wallets").where({ user_id: user.id }).first();
        if (!wallet) {
            yield trx.rollback();
            return res.status(404).json({ error: "Wallet not found" });
        }
        // Create a new deposit transaction
        yield trx("transactions").insert({
            wallet_id: wallet.id,
            type: "deposit",
            amount,
            status: "successful",
        });
        // Update the wallet balance
        yield trx("wallets")
            .where({ id: wallet.id })
            .update({ balance: db_1.default.raw("balance + ?", [amount]) });
        yield trx.commit();
        res.status(200).json({ message: "Deposit successful" });
    }
    catch (error) {
        yield trx.rollback();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.fundWallet = fundWallet;
//# sourceMappingURL=transaction.controllers.js.map