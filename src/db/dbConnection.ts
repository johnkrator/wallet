import connection from "./db";

export async function dbConnection() {
    try {
        await connection.raw("SELECT 1 + 1 AS result");
        console.log("Database connected successfully 💪");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}
