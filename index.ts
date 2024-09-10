import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import config from './config';
import usersRouter from './routers/users';

const app = express();
const port = 8000;

app.use(cors(config.corsOptions));
app.use(express.json());

app.use('/users', usersRouter);
// app.use('/tasks', tasksRouter);

const run = async () => {
  await mongoose.connect(config.database);

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

void run().catch(console.error);
