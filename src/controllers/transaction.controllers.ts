import {Response} from "express";
import db from "../db/db";
import {AuthenticatedRequest} from "../helpers/middlewares/authMiddleware";

export const fundWallet = async (req: AuthenticatedRequest, res: Response) => {
    const {amount} = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const trx = await db.transaction();

    try {
        // Fetch the user's wallet
        const wallet = await trx("wallets").where({user_id: user.id}).first();

        if (!wallet) {
            await trx.rollback();
            return res.status(404).json({error: "Wallet not found"});
        }

        // Create a new deposit transaction
        await trx("transactions").insert({
            wallet_id: wallet.id,
            type: "deposit",
            amount,
            status: "successful",
        });

        // Update the wallet balance
        await trx("wallets")
            .where({id: wallet.id})
            .update({balance: db.raw("balance + ?", [amount])});

        await trx.commit();
        res.status(200).json({message: "Deposit successful"});
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const withdrawFunds = async (req: AuthenticatedRequest, res: Response) => {
    const {amount} = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const trx = await db.transaction();

    try {
        // Fetch the user's wallet
        const wallet = await trx("wallets").where({user_id: user.id}).first();

        if (!wallet) {
            await trx.rollback();
            return res.status(404).json({error: "Wallet not found"});
        }

        // Check if the user has sufficient balance
        if (wallet.balance < amount) {
            await trx.rollback();
            return res.status(400).json({error: "Insufficient funds"});
        }

        // Create a new withdrawal transaction
        await trx("transactions").insert({
            wallet_id: wallet.id,
            type: "withdrawal",
            amount,
            status: "successful",
        });

        // Update the wallet balance
        await trx("wallets")
            .where({id: wallet.id})
            .update({balance: db.raw("balance - ?", [amount])});

        await trx.commit();
        res.status(200).json({message: "Withdrawal successful"});
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const transferFunds = async (req: AuthenticatedRequest, res: Response) => {
    const {recipientWalletId, amount} = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const trx = await db.transaction();

    try {
        // Fetch the sender's wallet
        const senderWallet = await trx("wallets")
            .where({user_id: user.id})
            .first();

        if (!senderWallet) {
            await trx.rollback();
            return res.status(404).json({error: "Sender wallet not found"});
        }

        // Check if the sender has sufficient balance
        if (senderWallet.balance < amount) {
            await trx.rollback();
            return res.status(400).json({error: "Insufficient balance"});
        }

        // Fetch the recipient's wallet
        const recipientWallet = await trx("wallets")
            .where({id: recipientWalletId})
            .first();

        if (!recipientWallet) {
            await trx.rollback();
            return res.status(404).json({error: "Recipient wallet not found"});
        }

        // Create a new transfer transaction
        await trx("transactions").insert({
            wallet_id: senderWallet.id,
            type: "transfer",
            amount,
            status: "successful",
            recipient_wallet_id: recipientWallet.id,
        });

        // Update the sender's wallet balance
        await trx("wallets")
            .where({id: senderWallet.id})
            .update({balance: db.raw("balance - ?", [amount])});

        // Update the recipient's wallet balance
        await trx("wallets")
            .where({id: recipientWallet.id})
            .update({balance: db.raw("balance + ?", [amount])});

        await trx.commit();
        res.status(200).json({message: "Transfer successful"});
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

