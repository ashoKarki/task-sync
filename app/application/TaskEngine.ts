import * as Crypto from 'expo-crypto';
import { Task } from '../domain/Task';
import { loadTasks, onNetworkChange, saveTasks } from '../infra';

type Subscriber = (tasks: Task[]) => void;
type NetworkSubscriber = (online: boolean) => void;

class TaskEngine {
    private tasks: Task[] = [];
    private online = false;
    private subscribers: Subscriber[] = [];
    private networkSubscribers: NetworkSubscriber[] = [];
    private processing = false;

    async init() {
        this.tasks = await loadTasks();
        this.notify();

        onNetworkChange((online) => {
            if (this.online !== online) {
                this.online = online;
                this.notifyNetwork();

                if (online) {
                    console.log('Network online, processing queue...');
                    this.processQueue();
                } else {
                    console.log('Network offline, queue paused.');
                }
            }
        });
    }

    subscribe(fn: Subscriber) {
        this.subscribers.push(fn);
        fn([...this.tasks]);
        return () => {
            this.subscribers = this.subscribers.filter(s => s !== fn);
        };
    }

    subscribeNetwork(fn: NetworkSubscriber) {
        this.networkSubscribers.push(fn);
        fn(this.online);
        return () => {
            this.networkSubscribers = this.networkSubscribers.filter(s => s !== fn);
        };
    }

    async queueMessage(message: string) {
        const task: Task = {
            id: await Crypto.randomUUID(),
            type: 'UPLOAD_MESSAGE',
            payload: { message, createdAt: Date.now() },
            retries: 0,
            maxRetries: 3,
            status: 'pending'
        };

        this.tasks.push(task);
        await saveTasks(this.tasks);
        this.notify();

        if (this.online) this.processQueue();
    }

    async processQueue() {
        if (this.processing) return;
        if (!this.online) return;

        this.processing = true;

        for (const task of this.tasks) {
            if (task.status !== 'pending') continue;

            task.status = 'processing';
            this.notify();

            try {
                await this.execute(task);
                this.tasks = this.tasks.filter(t => t.id !== task.id);
            } catch {
                task.retries++;
                task.status = task.retries >= task.maxRetries ? 'failed' : 'pending';
            }

            await saveTasks(this.tasks);
            this.notify();
        }

        this.processing = false;
    }

    private async execute(task: Task) {
        await new Promise(res => setTimeout(res, 2000));

        if (Math.random() < 0.3) {
            throw new Error('Simulated failure');
        }
    }

    private notify() {
        this.subscribers.forEach(fn => fn([...this.tasks]));
    }

    private notifyNetwork() {
        this.networkSubscribers.forEach(fn => fn(this.online));
    }
}

export const taskEngine = new TaskEngine();
