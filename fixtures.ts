import mongoose from 'mongoose';
import config from './config';
import User from './models/User';

const run = async () => {
  await mongoose.connect(config.database);
  const db = mongoose.connection;

  try {
    await db.dropDatabase();
    console.log('Database dropped successfully');
  } catch (e) {
    console.error('Error dropping database:', e);
  }

  await User.create({
      username: 'John',
      password: '123',
      token: 'tokenJohn',
    }, {
      username: 'Jane',
      password: '1234',
      token: 'tokenJane',
    }, {
      username: 'Dana',
      password: '123',
      token: 'tokenDana',
  });

  await db.close();
  await mongoose.disconnect();
};

run().catch(console.error);