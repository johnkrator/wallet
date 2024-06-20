"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_controllers_1 = require("../controllers/transaction.controllers");
const authMiddleware_1 = require("../helpers/middlewares/authMiddleware");
const router = express_1.default.Router();
router.post("/deposit", authMiddleware_1.authenticate, transaction_controllers_1.fundWallet);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map