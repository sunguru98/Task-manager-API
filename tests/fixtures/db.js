const jwt = require('jsonwebtoken') // Json web token module
const mongoose = require('mongoose') // ObjectID generation module
const User = require('../../src/models/user') // User model
const Task = require('../../src/models/task') // Task model

// Auto generate IDS
// For users
const _id = new mongoose.Types.ObjectId()
const _id1 = new mongoose.Types.ObjectId()
// For tasks
const _id2 = new mongoose.Types.ObjectId()
const _id3 = new mongoose.Types.ObjectId()
const _id4 = new mongoose.Types.ObjectId()
const _id5 = new mongoose.Types.ObjectId()

// User seed data
const newUser = {
  _id,
  name: 'Nirmala Ramkumar',
  email: 'nivetha4564@gmail.com',
  password: 'Nirmala1971',
  tasks: [_id2, _id3],
  accessTokens: [{
    token: jwt.sign({ _id }, process.env.JWT_SECRET_KEY)
  }]
}

const newUser1 = {
  _id: _id1,
  name: 'Ramkumar Murugaiyan',
  email: 'rkguruin@yahoo.com.sg',
  password: 'Mrk1171967',
  tasks: [_id4, _id5],
  accessTokens: [{
    token: jwt.sign({ _id1 }, process.env.JWT_SECRET_KEY)
  }]
}

// Task seed data
const task1 = {
  _id: _id2,
  description: 'First Task',
  isCompleted: true,
  user: _id
}

const task2 = {
  _id: _id3,
  description: 'Second Task',
  isCompleted: false,
  user: _id
}

const task3 = {
  _id: _id4,
  description: 'Third Task',
  isCompleted: true,
  user: _id1
}
const task4 = {
  _id: _id5,
  description: 'Fourth Task',
  isCompleted: false,
  user: _id1
}

const setUpUserDatabase = async () => {
  // Clear the database
  await User.deleteMany()
  await Task.deleteMany()
  // Create the seeded users
  await new User(newUser).save()
  await new User(newUser1).save()
  // Create the seeded tasks
  await new Task(task1).save()
  await new Task(task2).save()
  await new Task(task3).save()
  await new Task(task4).save()
}

module.exports = { _id, newUser, _id4, _id2, setUpUserDatabase }