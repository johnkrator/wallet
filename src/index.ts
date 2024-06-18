import express, {Application} from "express";
import connection from "./db/db";
import {generalErrorHandler, notFoundErrorHandler} from "./helpers/middlewares/errorMiddleware";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function dbConnection() {
    try {
        await connection.raw("SELECT 1 + 1 AS result");
        console.log("Database connected successfully 💪");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

app.use(notFoundErrorHandler);
app.use(generalErrorHandler);

dbConnection();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
