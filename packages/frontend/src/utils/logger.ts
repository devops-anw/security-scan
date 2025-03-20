import pino from 'pino';

const isServer = typeof window === 'undefined';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    browser: {
        write: {
            info: (o) => console.log(JSON.stringify(o, null, 2)),
            warn: (o) => console.warn(JSON.stringify(o, null, 2)),
            error: (o) => console.error(JSON.stringify(o, null, 2)),
        },
    },
    ...(!isServer && { transport: { target: 'pino-pretty' } }),
    serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err
    }
});

export default logger;