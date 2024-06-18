import knex, {Knex} from "knex";
import * as dotenv from "dotenv";
import config from "../../knexfile";

dotenv.config();

const environment = process.env.NODE_ENV || "development";
const connectionConfig = config[environment].connection as Knex.MySql2ConnectionConfig;

async function createDatabase() {
    const {host, user, password, database} = connectionConfig;
    const connection = knex({
        client: "mysql2",
        connection: {host, user, password},
    });

    try {
        await connection.raw("CREATE DATABASE IF NOT EXISTS ??", [database]);
        console.log(`Database '${database}' created or already exists.`);
    } catch (error) {
        console.error("Error creating database:", error);
    } finally {
        await connection.destroy();
    }
}

createDatabase().then(() => console.log("Database created"));
