const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env (expected to live in the backend root).
// Prefer dotenv if installed; otherwise fall back to a minimal parser.
function loadEnv() {
    try {
        // eslint-disable-next-line global-require
        require('dotenv').config();
        return;
    } catch (err) {
        // Ignore: dotenv not installed
    }

    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const eqIndex = line.indexOf('=');
        if (eqIndex === -1) continue;

        const key = line.slice(0, eqIndex).trim();
        let value = line.slice(eqIndex + 1).trim();

        // Strip surrounding single/double quotes
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

loadEnv();

function readDbConfigFromEnv() {
    // Prefer a single DATABASE_URL if provided (common in production hosts)
    if (process.env.DATABASE_URL) {
        const config = {
            connectionString: process.env.DATABASE_URL,
        };

        // Optional SSL for managed Postgres providers
        if (process.env.PGSSL === 'true') {
            config.ssl = { rejectUnauthorized: false };
        }

        return config;
    }

    // Local/dev-style discrete env vars (support both POSTGRES_* and PG*)
    return {
        user: process.env.PGUSER || process.env.POSTGRES_USER,
        host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
        database: process.env.PGDATABASE || process.env.POSTGRES_DB,
        password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
        port: Number(process.env.PGPORT || process.env.POSTGRES_PORT || 5432),
    };
}

const pool = new Pool(readDbConfigFromEnv());

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

module.exports = pool;
