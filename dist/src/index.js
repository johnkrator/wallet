"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorMiddleware_1 = require("./helpers/middlewares/errorMiddleware");
const onboarding_routes_1 = __importDefault(require("./routes/users/onboarding.routes"));
const users_routes_1 = __importDefault(require("./routes/users/users.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const dbConnection_1 = require("./db/dbConnection");
dotenv_1.default.config();
const app = (0, express_1.default)();
const apiBaseURL = process.env.API_BASE_URL || "/api/v1";
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(`${apiBaseURL}/auth`, onboarding_routes_1.default);
app.use(`${apiBaseURL}/users`, users_routes_1.default);
app.use(`${apiBaseURL}/wallets`, transaction_routes_1.default);
app.use(errorMiddleware_1.notFoundErrorHandler);
app.use(errorMiddleware_1.generalErrorHandler);
(0, dbConnection_1.dbConnection)();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Welcome route
app.get(apiBaseURL, (_req, res) => {
    res.status(200).send("Welcome to the Demo Credit API");
});
//# sourceMappingURL=index.js.map