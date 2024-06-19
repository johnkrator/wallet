import express from "express";
import {login, register, verifyEmail} from "../controllers/user/onboarding.controller";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

export default router;
