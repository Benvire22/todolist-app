import express from 'express';
import auth, { RequestWithUser } from '../middleware/auth';
import Task from '../models/Task';
import mongoose from 'mongoose';

const tasksRouter = express.Router();

tasksRouter.get('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).send('User not found!');
    }

    const tasks = await Task.find({user: req.user});

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

    if (!req.body.title || !req.body.status) {
      return res.status(404).send('Title or status are required!');
    }

    const task = new Task({
      user: req.user,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
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
      return res.status(400).send('User not found!');
    }

    if (!req.body.title || !req.body.status) {
      return res.status(404).send('Title or status are required!');
    }

    const task = await Task.findById(req.params.id).where('user').equals(req.user);

    if (!task) {
      return res.status(403).send({error: 'Task is not found!'});
    }

    task.title = req.body.title;
    task.description = req.body.description;
    task.status = req.body.status;

    await task.save();
    return res.send(task);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(403).send(e);
    }

    return next(e);
  }
});

tasksRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).send('User not found!');
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id).where('user').equals(req.user);

    if (!deletedTask) {
      return res.status(403).send('Task not found!');
    }

    return res.send({taskId: deletedTask._id});
  } catch (e) {
    return next(e);
  }
});


export default tasksRouter;