const request = require('supertest') // Testing library under express
const app = require('../src/app') // Server app
const Task = require('../src/models/task') // Task model
const { _id, newUser, _id4, _id2, setUpUserDatabase } = require('./fixtures/db') // Common user document access

beforeEach(setUpUserDatabase)

test('Should create a task for user', async () => {
  const response = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send({
      description: 'To wake up early'
    }).expect(200)
  // Fetch the task to check whether it's persisted
  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  // Check whether the sent user's id is stored
  // expect(task.user).toBe(_id)
})

test('Should not create task with invalid description', async () => {
  await request(app).post('/tasks')
    .set('Authorization', newUser.accessTokens[0].token)
    .send({
      description: ''
    })
    .expect(406)
})

test('Should not create task with invalid isCompleted', async () => {
  await request(app).post('/tasks')
    .set('Authorization', newUser.accessTokens[0].token)
    .send({
      description: 'To buy vegetables',
      isCompleted: 'YES'
    })
    .expect(406)
})

test('Should get tasks of authenticated user', async () => {
  const response = await request(app).get('/tasks')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .expect(200)
  expect(response.body.count).toBe(2)
})

test('Should not delete task if asked by wrong user', async () => {
  await request(app).delete(`/tasks/${_id4}`)
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send()
    .expect(404)
  // Check that the task has not been deleted in the database
  const task = await Task.findById(_id4)
  expect(task).not.toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
  await request(app).delete(`/tasks/${_id4}`)
    .send()
    .expect(401)
  // Check that the task has not been deleted in the database
  const task = await Task.findById(_id4)
  expect(task).not.toBeNull()
})

test('Should delete task if asked by authenticated user', async () => {
  await request(app).delete(`/tasks/${_id2}`)
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send()
    .expect(200)
  // Check that the task has not been deleted in the database
  const task = await Task.findById(_id2)
  expect(task).toBeNull()
})

test('Should not update task if asked by wrong user', async () => {
  await request(app).put(`/tasks/${_id4}`)
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send({
      description: 'Something else task'
    })
    .expect(404)
  // Check that the task has not been deleted in the database
  const task = await Task.findById(_id4)
  expect(task.description).toBe('Third Task')
})

test('Should fetch user task by id', async () => {
  const response = await request(app).get(`/tasks/${_id2}`)
    .set('Authorization', newUser.accessTokens[0].token)
    .send()
    .expect(200)
  expect(response.body.description).toBe('First Task')
})

test('Should not fetch user task by id if unauthenticated', async () => {
  const response = await request(app).get(`/tasks/${_id2}`)
    .send()
    .expect(401)
  expect(response.body.message).not.toBeNull()
})

test('Should not fetch other user\'s task by id', async () => {
  const response = await request(app).get(`/tasks/${_id4}`)
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send()
    .expect(404)
  expect(response.body.message).not.toBeNull()
})

test('Should fetch user tasks (only completed)', async () => {
  const response = await request(app).get(`/tasks?completed=true`)
    .set('Authorization', newUser.accessTokens[0].token)
    .send()
    .expect(200)
  expect(response.body.tasks[0].isCompleted).toBe(true)
})

test('Should fetch user tasks (only incomplete)', async () => {
  const response = await request(app).get(`/tasks?completed=false`)
    .set('Authorization', newUser.accessTokens[0].token)
    .send()
    .expect(200)
  expect(response.body.tasks[0].isCompleted).toBe(false)
})