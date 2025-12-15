import * as FileSystem from 'expo-file-system/legacy';
import { Task } from '../domain/Task';

const TASK_FILE = FileSystem.documentDirectory + 'tasks.json';

export const loadTasks = async (): Promise<Task[]> => {
    try {
        const data = await FileSystem.readAsStringAsync(TASK_FILE);
        return JSON.parse(data);
    } catch {
        return [];
    }
};

export const saveTasks = async (tasks: Task[]) => {
    await FileSystem.writeAsStringAsync(
        TASK_FILE,
        JSON.stringify(tasks)
    );
};
