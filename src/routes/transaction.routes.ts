import express from "express";
import {fundWallet, getWalletTransactions, transferFunds, withdrawFunds} from "../controllers/transaction.controllers";
import {authenticate} from "../helpers/middlewares/authMiddleware";

const router = express.Router();

router.post("/deposit", authenticate, fundWallet);
router.post("/withdraw", authenticate, withdrawFunds);
router.post("/transfer", authenticate, transferFunds);
router.get("/:walletId", authenticate, getWalletTransactions);

export default router;
