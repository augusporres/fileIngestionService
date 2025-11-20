import 'dotenv/config';
import { processFile, processingStatus } from './worker/worker';
import { logError, logInfo } from './utils/log';
import http from 'http';
import { closePool, getPool } from './db/config/database';

const PORT = process.env.PORT || 3000;

/**
 * Get system metrics (CPU and memory usage)
 */
function getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
        memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB (Resident Set Size)
            external: Math.round(memUsage.external / 1024 / 1024) // MB
        },
        cpu: {
            user: Math.round(cpuUsage.user / 1000), // microseconds to milliseconds
            system: Math.round(cpuUsage.system / 1000)
        },
        uptime: Math.round(process.uptime()) // seconds
    };
}

/**
 * Calculate progress percentage
 */
function getProgress() {
    if (!processingStatus.isProcessing && !processingStatus.endTime) {
        return 0;
    }
    if (processingStatus.endTime) {
        return 100;
    }
    if (processingStatus.fileSize === 0) {
        return 0;
    }
    // Estimate based on processed lines (rough estimate)
    return Math.min(99, Math.round((processingStatus.processedLines / (processingStatus.fileSize / 100)) * 100));
}

async function main() {
    const server = http.createServer(async (req, res) => {
        if (req.url === '/health' && req.method === 'GET') {
            try {
                const pool = await getPool();
                await pool.request().query('SELECT 1');
                
                const metrics = getSystemMetrics();
                const progress = getProgress();
                
                const response = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    database: 'connected',
                    processing: {
                        active: processingStatus.isProcessing,
                        progress: `${progress}%`,
                        startTime: processingStatus.startTime,
                        endTime: processingStatus.endTime,
                        totalLines: processingStatus.totalLines,
                        processedLines: processingStatus.processedLines,
                        insertedRecords: processingStatus.insertedRecords,
                        corruptedLines: processingStatus.corruptedLines,
                        error: processingStatus.error
                    },
                    metrics
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json'});
                res.end(JSON.stringify(response, null, 2));
            } catch (err) {
                const response = {
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    database: 'disconnected',
                    error: String(err)
                };
                res.writeHead(503, { 'Content-Type': 'application/json'});
                res.end(JSON.stringify(response, null, 2));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    })

    server.listen(PORT, () => {
        logInfo('Server started', { port: PORT });
    })
    
    processFile()
    .catch(err => {
        logError('Error processing file', { error: String(err) });    
    });

    process.on('SIGTERM', async () => {
        await closePool();
        server.close(() => process.exit(0));
    });
}

main().catch(err => {
    logError('Application failed to start', { error: String(err) });
    process.exit(1);
})