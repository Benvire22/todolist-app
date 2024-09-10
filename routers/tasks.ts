import express from 'express';
import auth, { RequestWithUser } from '../middleware/auth';
import Task from '../models/Task';
import mongoose from 'mongoose';

const tasksRouter = express.Router();

tasksRouter.get('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).send('User not found!');
    }

    const tasks = await Task.find({ user: req.user }).populate('user', 'username');

    return res.send(tasks);
  } catch (e) {
    return next(e);
  }
});

tasksRouter.post('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).send('User not found!');
    }

    if (!req.body.title) {
      return res.status(404).send({ error: 'Title is required!' });
    }

    const task = new Task({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description || null,
      status: 'new',
    });

    await task.save();
    return res.send(task);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(401).send(e);
    }

    return next(e);
  }
});

tasksRouter.put('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).send({ error: 'User not found!' });
    }

    if (!req.body.title) {
      return res.status(404).send({ error: 'Title are required!' });
    }

    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(404).json({ message: 'Invalid task ID' });
    }

    const taskStatus = req.body.status;

    const updateTask = {
      title: req.body.title,
      description: req.body.description || null,
    };

    const task = await Task.findByIdAndUpdate(taskId, updateTask, { new: true }).where('user').equals(req.user);

    if (!task) {
      return res.status(403).send({ error: 'Task not found!' });
    }

    if (taskStatus === 'in_progress' || taskStatus === 'complete') {
      task.status = taskStatus;
    }

    await task.save();
    return res.send(task);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(401).send(e);
    }

    return next(e);
  }
});

tasksRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).send({ error: 'User not found!' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Invalid task ID' });
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id).where('user').equals(req.user);

    if (!deletedTask) {
      return res.status(403).send({ error: 'Task not found!' });
    }

    return res.send({ taskId: deletedTask._id });
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(401).send(e);
    }

    return next(e);
  }
});

export default tasksRouter;
