export async function insertBatch(rows: any[]): Promise<void> {
    return new Promise((resolve) => {        
        setTimeout(() => {
            console.log(`Inserted ${rows.length} records.`);
            resolve();
        }, 100);
    });
}