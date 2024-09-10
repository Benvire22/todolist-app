import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';

const usersRouter = express.Router();

usersRouter.post('/', async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(409).send({ error: 'This username already exists!' });
    }

    const user = new User({
      username: req.body.username,
      password: req.body.password,
      token: randomUUID(),
    });

    await user.save();
    return res.send(user);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(401).send(e);
    }

    return next(e);
  }
});

usersRouter.post('/sessions', async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(404).send({ error: 'username or password are required!' });
    }

    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).send({ error: 'username not found!' });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(401).send({ error: 'Password is wrong!' });
    }

    user.token = randomUUID();

    await user.save();
    return res.send(user);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(401).send(e);
    }

    return next(e);
  }
});

export default usersRouter;
