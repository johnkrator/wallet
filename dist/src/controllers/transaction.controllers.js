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
exports.getWalletTransactions = exports.transferFunds = exports.withdrawFunds = exports.fundWallet = void 0;
const db_1 = __importDefault(require("../db/db"));
const sendTransactionNotificationEmail_1 = __importDefault(require("../helpers/emailService/sendTransactionNotificationEmail"));
const fundWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const trx = yield db_1.default.transaction();
    try {
        // Fetch the user's wallet and email
        const [wallet, userDetails] = yield Promise.all([
            trx("wallets").where({ user_id: user.id }).first(),
            trx("users").where({ id: user.id }).select("email").first()
        ]);
        if (!wallet) {
            yield trx.rollback();
            return res.status(404).json({ error: "Wallet not found" });
        }
        if (!userDetails) {
            yield trx.rollback();
            return res.status(404).json({ error: "User details not found" });
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
        // Fetch the updated wallet balance
        const updatedWallet = yield trx("wallets")
            .where({ id: wallet.id })
            .select("balance")
            .first();
        yield trx.commit();
        res.status(200).json({ message: "Deposit successful" });
        // Send email notification
        yield (0, sendTransactionNotificationEmail_1.default)(userDetails.email, {
            type: "deposit",
            amount: amount,
            balance: updatedWallet.balance
        });
    }
    catch (error) {
        yield trx.rollback();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.fundWallet = fundWallet;
const withdrawFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const trx = yield db_1.default.transaction();
    try {
        // Fetch the user's wallet and email
        const [wallet, userDetails] = yield Promise.all([
            trx("wallets").where({ user_id: user.id }).first(),
            trx("users").where({ id: user.id }).select("email").first()
        ]);
        if (!wallet) {
            yield trx.rollback();
            return res.status(404).json({ error: "Wallet not found" });
        }
        if (!userDetails) {
            yield trx.rollback();
            return res.status(404).json({ error: "User details not found" });
        }
        // Check if the user has sufficient balance
        if (wallet.balance < amount) {
            yield trx.rollback();
            return res.status(400).json({ error: "Insufficient funds" });
        }
        // Create a new withdrawal transaction
        yield trx("transactions").insert({
            wallet_id: wallet.id,
            type: "withdrawal",
            amount,
            status: "successful",
        });
        // Update the wallet balance
        yield trx("wallets")
            .where({ id: wallet.id })
            .update({ balance: db_1.default.raw("balance - ?", [amount]) });
        // Fetch the updated wallet balance
        const updatedWallet = yield trx("wallets")
            .where({ id: wallet.id })
            .select("balance")
            .first();
        yield trx.commit();
        res.status(200).json({ message: "Withdrawal successful" });
        // Send email notification
        yield (0, sendTransactionNotificationEmail_1.default)(userDetails.email, {
            type: "withdrawal",
            amount: amount,
            balance: updatedWallet.balance
        });
    }
    catch (error) {
        yield trx.rollback();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.withdrawFunds = withdrawFunds;
const transferFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipientWalletId, amount } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const trx = yield db_1.default.transaction();
    try {
        // Fetch the sender's wallet and email
        const [senderWallet, senderDetails] = yield Promise.all([
            trx("wallets").where({ user_id: user.id }).first(),
            trx("users").where({ id: user.id }).select("email").first()
        ]);
        if (!senderWallet || !senderDetails) {
            yield trx.rollback();
            return res.status(404).json({ error: "Sender wallet or details not found" });
        }
        // Check if the sender has sufficient balance
        if (senderWallet.balance < amount) {
            yield trx.rollback();
            return res.status(400).json({ error: "Insufficient balance" });
        }
        // Fetch the recipient's wallet and email
        const [recipientWallet, recipientDetails] = yield Promise.all([
            trx("wallets").where({ id: recipientWalletId }).first(),
            trx("users").join("wallets", "users.id", "wallets.user_id")
                .where("wallets.id", recipientWalletId)
                .select("users.email")
                .first()
        ]);
        if (!recipientWallet || !recipientDetails) {
            yield trx.rollback();
            return res.status(404).json({ error: "Recipient wallet or details not found" });
        }
        // Create a new transfer transaction
        yield trx("transactions").insert({
            wallet_id: senderWallet.id,
            type: "transfer",
            amount,
            status: "successful",
            recipient_wallet_id: recipientWallet.id,
        });
        // Update the sender's wallet balance
        yield trx("wallets")
            .where({ id: senderWallet.id })
            .update({ balance: db_1.default.raw("balance - ?", [amount]) });
        // Update the recipient's wallet balance
        yield trx("wallets")
            .where({ id: recipientWallet.id })
            .update({ balance: db_1.default.raw("balance + ?", [amount]) });
        // Fetch updated balances
        const [updatedSenderWallet, updatedRecipientWallet] = yield Promise.all([
            trx("wallets").where({ id: senderWallet.id }).select("balance").first(),
            trx("wallets").where({ id: recipientWallet.id }).select("balance").first()
        ]);
        yield trx.commit();
        res.status(200).json({ message: "Transfer successful" });
        // Send email notifications
        yield Promise.all([
            (0, sendTransactionNotificationEmail_1.default)(senderDetails.email, {
                type: "transfer",
                amount: amount,
                balance: updatedSenderWallet.balance,
                recipientEmail: recipientDetails.email
            }),
            (0, sendTransactionNotificationEmail_1.default)(recipientDetails.email, {
                type: "deposit",
                amount: amount,
                balance: updatedRecipientWallet.balance
            })
        ]);
    }
    catch (error) {
        yield trx.rollback();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.transferFunds = transferFunds;
const getWalletTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    // Validate walletId as a number
    const walletIdNumber = parseInt(walletId, 10);
    if (isNaN(walletIdNumber) || walletIdNumber <= 0) {
        return res.status(400).json({ error: "Invalid walletId" });
    }
    const trx = yield db_1.default.transaction();
    try {
        // Fetch the user's wallet
        const wallet = yield trx("wallets")
            .where({ id: walletIdNumber, user_id: user.id })
            .first();
        if (!wallet) {
            yield trx.rollback();
            return res.status(404).json({ error: "Wallet not found" });
        }
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = 10;
        const offset = (page - 1) * perPage;
        // Fetch the wallet transactions with pagination
        const transactions = yield trx("transactions")
            .where({ wallet_id: wallet.id })
            .orderBy("timestamp", "desc")
            .limit(perPage)
            .offset(offset)
            .select("*");
        yield trx.commit();
        res.status(200).json({ transactions });
    }
    catch (error) {
        yield trx.rollback();
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getWalletTransactions = getWalletTransactions;
//# sourceMappingURL=transaction.controllers.js.map