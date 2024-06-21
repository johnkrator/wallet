"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../../controllers/users/user.controller");
const authMiddleware_1 = require("../../helpers/middlewares/authMiddleware");
const router = express_1.default.Router();
router.route("/")
    .get(user_controller_1.getUsers);
router.route("/me")
    .get(authMiddleware_1.authenticate, user_controller_1.getCurrentUser);
router.route("/:id")
    .get(user_controller_1.getUser)
    .put(user_controller_1.updateUser)
    .delete(user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map