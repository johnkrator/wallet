import type {Knex} from "knex";
import * as dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: "./src/db/migrations"
        },
        seeds: {
            directory: "./src/db/seeds"
        }
    }
};

export default config;
