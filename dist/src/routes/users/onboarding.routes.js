"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const onboarding_controller_1 = require("../../controllers/users/onboarding.controller");
const router = express_1.default.Router();
router.post("/register", onboarding_controller_1.register);
router.post("/verify-email", onboarding_controller_1.verifyEmail);
router.post("/login", onboarding_controller_1.login);
exports.default = router;
//# sourceMappingURL=onboarding.routes.js.map