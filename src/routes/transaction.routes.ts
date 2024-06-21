import express from "express";
import {fundWallet, getWalletTransactions, transferFunds, withdrawFunds} from "../controllers/transaction.controllers";
import {authenticate} from "../helpers/middlewares/authMiddleware";

const router = express.Router();

router.route("/deposit")
    .post(authenticate, fundWallet);

router.route("/withdraw")
    .post(authenticate, withdrawFunds);

router.route("/transfer")
    .post(authenticate, transferFunds);

router.route("/:walletId")
    .get(authenticate, getWalletTransactions);

export default router;
