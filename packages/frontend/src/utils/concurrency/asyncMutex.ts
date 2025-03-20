export class AsyncMutex {
    private mutex = Promise.resolve();

    async lock<T>(fn: () => Promise<T> | T): Promise<T> {
        let release: () => void;

        const newMutex = new Promise<void>((resolve) => {
            release = () => resolve();
        });

        const criticalSection = this.mutex.then(() => fn());
        this.mutex = this.mutex.then(() => newMutex);

        try {
            return await criticalSection;
        } finally {
            release!();
        }
    }

    async withTimeout<T>(timeoutMs: number, fn: () => Promise<T> | T): Promise<T> {
        let timer: NodeJS.Timeout;
        return Promise.race([
            this.lock(fn),
            new Promise<T>((_, reject) => {
                timer = setTimeout(() => reject(new Error('Mutex lock timed out')), timeoutMs);
            })
        ]).finally(() => clearTimeout(timer));
    }
}