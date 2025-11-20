import fs from 'fs';
import readline from 'readline';
import { parseLine } from './parse-line';
import { insertBatch } from './insert-batch';
import {logWarn, logError, logInfo} from '../utils/log';
require('path');
import path from 'path';

const FILE_PATH = path.resolve(__dirname, '..', '..', 'challenge', 'input', 'CLIENTES_IN_0425.dat'); // mounted path in Docker/K8s

export const processingStatus = {
    isProcessing: false,
    startTime: null as Date | null,
    endTime: null as Date | null,
    totalLines: 0,
    processedLines: 0,
    corruptedLines: 0,
    insertedRecords: 0,
    fileSize: 0,
    error: null as string | null
};

export async function processFile() {
    processingStatus.isProcessing = true;
    processingStatus.startTime = new Date();
    processingStatus.error = null;
    
    // Get file size for progress calculation
    try {
        const stats = fs.statSync(FILE_PATH);
        processingStatus.fileSize = stats.size;
    } catch (err) {
        logWarn('Could not get file size', { error: String(err) });
    }
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
    let bytesProcessed = 0;
    
    try {
        for await (const line of rl) {
            processingStatus.processedLines++;
            bytesProcessed += Buffer.byteLength(line, 'utf8') + 1; // +1 for newline
            
            try{
                const row = await parseLine(line);
                batch.push(row);
            } catch (err) {
                processingStatus.corruptedLines++;
                logWarn('Corrupted line skipped', { 
                    file: FILE_PATH,
                    lineNumber, 
                    error: String(err)
                });
                lineNumber++;
                continue;
            }

            if (batch.length >= BATCH_SIZE) {
                await insertBatch(batch);
                processingStatus.insertedRecords += batch.length;
                batch.length = 0;
                
                // Log progress every 10 batches (10k records)
                if (processingStatus.insertedRecords % 10000 === 0) {
                    const progress = processingStatus.fileSize > 0 
                        ? ((bytesProcessed / processingStatus.fileSize) * 100).toFixed(2)
                        : 0;
                    logInfo('Processing progress', {
                        insertedRecords: processingStatus.insertedRecords,
                        processedLines: processingStatus.processedLines,
                        corruptedLines: processingStatus.corruptedLines,
                        progressPercent: progress
                    });
                }
            }
            lineNumber++;
        }

        if (batch.length > 0) {
            await insertBatch(batch);
            processingStatus.insertedRecords += batch.length;
        }

        processingStatus.totalLines = lineNumber - 1;
        processingStatus.endTime = new Date();
        processingStatus.isProcessing = false;
        
        const duration = processingStatus.endTime.getTime() - processingStatus.startTime!.getTime();
        logInfo('Processing completed', {
            totalLines: processingStatus.totalLines,
            insertedRecords: processingStatus.insertedRecords,
            corruptedLines: processingStatus.corruptedLines,
            durationMs: duration,
            recordsPerSecond: Math.round((processingStatus.insertedRecords / duration) * 1000)
        });
    } catch (err) {
        processingStatus.error = String(err);
        processingStatus.endTime = new Date();
        processingStatus.isProcessing = false;
        throw err;
    }
}
