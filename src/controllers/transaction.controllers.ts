import {Response} from "express";
import db from "../db/db";
import {AuthenticatedRequest} from "../helpers/middlewares/authMiddleware";
import sendTransactionNotificationEmail from "../helpers/emailService/sendTransactionNotificationEmail";

export const fundWallet = async (req: AuthenticatedRequest, res: Response) => {
    const {amount} = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const trx = await db.transaction();

    try {
        // Fetch the user's wallet and email
        const [wallet, userDetails] = await Promise.all([
            trx("wallets").where({user_id: user.id}).first(),
            trx("users").where({id: user.id}).select("email").first()
        ]);

        if (!wallet) {
            await trx.rollback();
            return res.status(404).json({error: "Wallet not found"});
        }

        if (!userDetails) {
            await trx.rollback();
            return res.status(404).json({error: "User details not found"});
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

        // Fetch the updated wallet balance
        const updatedWallet = await trx("wallets")
            .where({id: wallet.id})
            .select("balance")
            .first();

        await trx.commit();
        res.status(200).json({message: "Deposit successful"});

        // Send email notification
        await sendTransactionNotificationEmail(userDetails.email, {
            type: "deposit",
            amount: amount,
            balance: updatedWallet.balance
        });
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
        // Fetch the user's wallet and email
        const [wallet, userDetails] = await Promise.all([
            trx("wallets").where({user_id: user.id}).first(),
            trx("users").where({id: user.id}).select("email").first()
        ]);

        if (!wallet) {
            await trx.rollback();
            return res.status(404).json({error: "Wallet not found"});
        }

        if (!userDetails) {
            await trx.rollback();
            return res.status(404).json({error: "User details not found"});
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

        // Fetch the updated wallet balance
        const updatedWallet = await trx("wallets")
            .where({id: wallet.id})
            .select("balance")
            .first();

        await trx.commit();
        res.status(200).json({message: "Withdrawal successful"});

        // Send email notification
        await sendTransactionNotificationEmail(userDetails.email, {
            type: "withdrawal",
            amount: amount,
            balance: updatedWallet.balance
        });
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
        // Fetch the sender's wallet and email
        const [senderWallet, senderDetails] = await Promise.all([
            trx("wallets").where({user_id: user.id}).first(),
            trx("users").where({id: user.id}).select("email").first()
        ]);

        if (!senderWallet || !senderDetails) {
            await trx.rollback();
            return res.status(404).json({error: "Sender wallet or details not found"});
        }

        // Check if the sender has sufficient balance
        if (senderWallet.balance < amount) {
            await trx.rollback();
            return res.status(400).json({error: "Insufficient balance"});
        }

        // Fetch the recipient's wallet and email
        const [recipientWallet, recipientDetails] = await Promise.all([
            trx("wallets").where({id: recipientWalletId}).first(),
            trx("users").join("wallets", "users.id", "wallets.user_id")
                .where("wallets.id", recipientWalletId)
                .select("users.email")
                .first()
        ]);

        if (!recipientWallet || !recipientDetails) {
            await trx.rollback();
            return res.status(404).json({error: "Recipient wallet or details not found"});
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

        // Fetch updated balances
        const [updatedSenderWallet, updatedRecipientWallet] = await Promise.all([
            trx("wallets").where({id: senderWallet.id}).select("balance").first(),
            trx("wallets").where({id: recipientWallet.id}).select("balance").first()
        ]);

        await trx.commit();
        res.status(200).json({message: "Transfer successful"});

        // Send email notifications
        await Promise.all([
            sendTransactionNotificationEmail(senderDetails.email, {
                type: "transfer",
                amount: amount,
                balance: updatedSenderWallet.balance,
                recipientEmail: recipientDetails.email
            }),
            sendTransactionNotificationEmail(recipientDetails.email, {
                type: "deposit",
                amount: amount,
                balance: updatedRecipientWallet.balance
            })
        ]);
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getWalletTransactions = async (req: AuthenticatedRequest, res: Response) => {
    const {walletId} = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({error: "Unauthorized"});
    }

    // Validate walletId as a number
    const walletIdNumber = parseInt(walletId, 10);
    if (isNaN(walletIdNumber) || walletIdNumber <= 0) {
        return res.status(400).json({error: "Invalid walletId"});
    }

    const trx = await db.transaction();

    try {
        // Fetch the user's wallet
        const wallet = await trx("wallets")
            .where({id: walletIdNumber, user_id: user.id})
            .first();

        if (!wallet) {
            await trx.rollback();
            return res.status(404).json({error: "Wallet not found"});
        }

        // Pagination
        const page = parseInt(req.query.page as string, 10) || 1;
        const perPage = 10;
        const offset = (page - 1) * perPage;

        // Fetch the wallet transactions with pagination
        const transactions = await trx("transactions")
            .where({wallet_id: wallet.id})
            .orderBy("timestamp", "desc")
            .limit(perPage)
            .offset(offset)
            .select("*");

        await trx.commit();
        res.status(200).json({transactions});
    } catch (error) {
        await trx.rollback();
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
