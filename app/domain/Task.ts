export type TaskStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed';

export type Task = {
  id: string;
  type: 'UPLOAD_MESSAGE';
  payload: {
    message: string;
    createdAt: number;
  };
  retries: number;
  maxRetries: number;
  status: TaskStatus;
};
