function logInfo(message: string, meta: Record<string, unknown> = {}) {
    console.log(JSON.stringify({
        level: 'info',
        msg: message,
        ts: new Date().toISOString(),
        ... meta,
    }));
}

function logWarn(message: string, meta: Record<string, unknown> = {}) {
    console.warn(JSON.stringify({
        level: 'warn',
        msg: message,
        ts: new Date().toISOString(),
        ... meta,
    }))
}

function logError(message: string, meta: Record<string, unknown> = {}) {
    console.error(JSON.stringify({
        level: 'error',
        msg: message,
        ts: new Date().toISOString(),
        ... meta,
    }))
}

export { logInfo, logWarn, logError };