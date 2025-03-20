import { AsyncMutex } from '@/utils/concurrency/asyncMutex';
import logger from '@/utils/logger';
import { EmailOptions } from "@/services/emailService";

export interface EmailTask {
    id: string;
    options: EmailOptions;
    retries: number;
    nextRetry?: number;
    status: 'pending' | 'processing';
}

export class EmailQueue {
    private queue: Map<string, EmailTask> = new Map();
    private mutex = new AsyncMutex();

    async add(task: EmailTask): Promise<void> {
        await this.mutex.lock(async () => {
            this.queue.set(task.id, task);
            logger.info({ msg: "Task added to queue", id: task.id, to: task.options.to, subject: task.options.subject });
        });
    }

    async remove(id: string): Promise<void> {
        await this.mutex.lock(async () => {
            if (this.queue.delete(id)) {
                logger.info({ msg: "Task removed from queue", id });
            } else {
                logger.warn({ msg: "Attempted to remove non-existent task from queue", id });
            }
        });
    }

    async update(id: string, updateFn: (task: EmailTask) => EmailTask): Promise<void> {
        await this.mutex.lock(async () => {
            const task = this.queue.get(id);
            if (task) {
                const updatedTask = updateFn(task);
                this.queue.set(id, updatedTask);
                logger.info({ msg: "Task updated in queue", id });
            } else {
                logger.warn({ msg: "Attempted to update non-existent task in queue", id });
            }
        });
    }

    async updateStatus(id: string, fromStatus: 'pending' | 'processing', toStatus: 'pending' | 'processing'): Promise<boolean> {
        return this.mutex.lock(async () => {
            const task = this.queue.get(id);
            if (task && task.status === fromStatus) {
                task.status = toStatus;
                this.queue.set(id, task);
                return true;
            }
            return false;
        });
    }

    async getTasks(): Promise<EmailTask[]> {
        return this.mutex.lock(async () => Array.from(this.queue.values()));
    }

    async getTask(id: string): Promise<EmailTask | undefined> {
        return this.mutex.lock(async () => this.queue.get(id));
    }

    async size(): Promise<number> {
        return this.mutex.lock(async () => this.queue.size);
    }
}