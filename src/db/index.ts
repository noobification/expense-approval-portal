import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config(); // Resolves natively from execution context dir

// Disable prefetch as it is not supported for "Transaction" pool mode (Supabase typically)
// Appending SSL mode which is required for Supabase
let connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!connectionString) {
    const availableKeys = Object.keys(process.env).filter(key =>
        !key.includes('PASS') && !key.includes('KEY') && !key.includes('AUTH') && !key.includes('SECRET')
    ).join(', ');

    throw new Error(
        "❌ DATABASE_URL is not defined in the environment.\n" +
        "Check your Railway Variables. Available variables found: " + availableKeys + "\n" +
        "Ensure you have a variable named exactly 'DATABASE_URL' (without the VITE_ prefix for the server)."
    );
}

if (!connectionString.includes("sslmode=")) {
    connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=require";
}

const client = postgres(connectionString, {
    prepare: false,
    ssl: { rejectUnauthorized: false } // Required for some Supabase pooler setups
});

export const db = drizzle(client, { schema });
