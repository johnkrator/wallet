import express, {Application, Request, Response} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import {generalErrorHandler, notFoundErrorHandler} from "./helpers/middlewares/errorMiddleware";
import authRoutes from "./routes/users/onboarding.routes";
import usersRoutes from "./routes/users/users.routes";
import transactionRoutes from "./routes/transaction.routes";
import {dbConnection} from "./db/dbConnection";

dotenv.config();

const app: Application = express();
const apiBaseURL = process.env.API_BASE_URL || "/api/v1";

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors());

app.use(`${apiBaseURL}/auth`, authRoutes);
app.use(`${apiBaseURL}/users`, usersRoutes);
app.use(`${apiBaseURL}/wallets`, transactionRoutes);

app.use(notFoundErrorHandler);
app.use(generalErrorHandler);

dbConnection();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Welcome route
app.get(apiBaseURL, (_req: Request, res: Response) => {
    res.status(200).send("Welcome to the Demo Credit API");
});
