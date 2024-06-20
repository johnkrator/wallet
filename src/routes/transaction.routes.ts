import express from "express";
import {fundWallet} from "../controllers/transaction.controllers";
import {authenticate} from "../helpers/middlewares/authMiddleware";

const router = express.Router();

router.post("/deposit", authenticate, fundWallet);

export default router;
