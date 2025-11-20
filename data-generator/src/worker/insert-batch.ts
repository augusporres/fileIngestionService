import { getPool, closePool } from '../db/config/database';
import * as sql from 'mssql';

export async function insertBatch(rows: any[]): Promise<void> {
    const pool = await getPool();
    const table = new sql.Table('Clients');
    table.create = false; // Table already exists
    // Define columns matching the database schema
    table.columns.add('NombreCompleto', sql.NVarChar(100), { nullable: false });
    table.columns.add('DNI', sql.BigInt, { nullable: false });
    table.columns.add('Estado', sql.VarChar(10), { nullable: false });
    table.columns.add('FechaIngreso', sql.Date, { nullable: false });
    table.columns.add('EsPEP', sql.Bit, { nullable: false });
    table.columns.add('EsSujetoObligado', sql.Bit, { nullable: true });
    table.columns.add('FechaCreacion', sql.DateTime, { nullable: false });
    // Add rows to the table
    const now = new Date();
    rows.forEach(row => {
    table.rows.add(
    row.fullName,
    row.document,
    row.status,
    row.ingressDate,
    row.isPEP,
    row.isObligatedSubject,
    now
    );
    });


    
    const request = new sql.Request(pool);
    await request.bulk(table);
    
}