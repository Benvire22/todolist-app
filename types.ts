import mongoose from 'mongoose';

export interface UserField {
  username: string;
  password: string;
  token: string;
}

export interface TaskFields {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | string;
  title: string;
  description: string | null;
  status: string;
}

export type TaskFieldsMutation = Omit<TaskFields, '_id'>;
