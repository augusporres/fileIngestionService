import * as sql from 'mssql';

const config = {
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'Clients',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: process.env.NODE_ENV === 'development',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000
    }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() : Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = await sql.connect(config);        
    }
    return pool;
}

export async function closePool() : Promise<void> {
    if (pool) {
        await pool.close();
        pool = null;
    }
}