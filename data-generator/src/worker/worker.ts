import fs from 'fs';
import readline from 'readline';
import { parseLine } from './parse-line';
import { insertBatch } from './insert-batch';
import {logWarn, logError, logInfo} from '../utils/log';
require('path');
import path from 'path';

const FILE_PATH = path.resolve(__dirname, '..', '..', 'challenge', 'input', 'CLIENTES_IN_0425.dat'); // mounted path in Docker/K8s

export async function processFile() {
    const stream = fs.createReadStream(FILE_PATH, {
        encoding: 'utf8',
        highWaterMark: 1024 * 64,
    });

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    const BATCH_SIZE = 1000;
    const batch: any[] = [];
    let lineNumber = 1;
    for await (const line of rl) {
        try{
            const row = await parseLine(line);
            batch.push(row);
        } catch (err) {
            // badlines ++;
            logWarn('Corrupted line skipped', { 
                file: FILE_PATH,
                lineNumber, 
                error: String(err)
            });
            continue;
        }

        if (batch.length >= BATCH_SIZE) {
            await insertBatch(batch);
            batch.length = 0;
        }
        lineNumber++;
    }

    if (batch.length > 0) {
        await insertBatch(batch);
    }

    console.log('Processing completed.');
}
