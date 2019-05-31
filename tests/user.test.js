const request = require('supertest') // Testing library under express
const app = require('../src/app') // Server app
const User = require('../src/models/user') // User model
const { _id, newUser, setUpUserDatabase } = require('./fixtures/db')

// Wiping out the database before each test runs
beforeEach (setUpUserDatabase)

test('Should create a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
    name: 'Sundeep Charan Ramkumar',
    email: 'webdevdesign@sundeepcharan.com',
    password: 'Sundeep1998'
  }).expect(200)
  const user = await User.findById(response.body.user._id)
  // The saved user should persist in the database
  expect(user).not.toBeNull()
  // To check whether the acesss token is sent correctly
  expect(response.body).toMatchObject({
    user: {
      name: 'Sundeep Charan Ramkumar',
      email: 'webdevdesign@sundeepcharan.com'
    },
    accessToken: `Bearer ${user.accessTokens[0].token}`
  })
  // Check whether password is hashed
  expect(user.password).not.toBe('Sundeep1998')
})

test('Should not signup a user with invalid name', async () => {
  await request(app).post('/users')
    .send({
      name: '',
      email: 'sunguru98@yahoo.co.in',
      password: 'Sundeep1998'
    }).expect(406)
})

test('Should not signup a user with invalid email', async () => {
  await request(app).post('/users')
    .send({
      name: 'Sundeep Charan',
      email: 'someemail@.com',
      password: 'Sundeep1998'
    }).expect(406)
})

test('Should not signup a user with invalid password', async () => {
  await request(app).post('/users')
    .send({
      name: 'Sundeep Charan',
      email: 'someemail@yahoo.com',
      password: 'Sun'
    }).expect(406)
})

test('Should login the registered user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send(newUser)
    .expect(200)

  // Grabbing the user from database
  const user = await User.findById(_id)
  expect(user.accessTokens[1].token).toBe(response.body.accessToken.replace('Bearer ', ''))
})

test('Should not login invalid user', async () => {
  await request(app)
    .post('/users/login')
    .send({
    email: 'sunguru98@yahoo.co.in',
    password: 'Sundeep1998'})
    .expect(401)
})

test('Should return the authenticated user', async () => {
  await request(app)
    .get('/user')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not return the authenticated user', async () => {
  await request(app)
    .get('/user')
    .send()
    .expect(401)
})

test('Should remove the authenticated user', async () => {
  const response = await request(app)
    .delete('/user')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .expect(200)
  // Trying to fetch the user
  const user = await User.findById(_id)
  expect(user).toBeNull()
})

test('Should not remove the authenticated user', async () => {
  await request(app)
    .delete('/user')
    .expect(401)
})

test('Should upload profile picture correctly', async () => {
  await request(app)
    .post('/user/profile')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .attach('profilepic', 'tests/fixtures/profile-pic.jpg').expect(200)
  // Fetch the user
  const user = await User.findById(_id)
  expect(user.profilePic).toEqual(expect.any(Buffer))
})

test('Should update valid user field', async () => {
  await request(app).put('/user')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send({
      name: 'Nirmala'
    })
    .expect(200)
  // Fetch user
  const user = await User.findById(_id)
  expect(user.name).toBe('Nirmala')
})

test('Should not update user if unauthenticated', async () => {
  await request(app).put('/user').send({ name: 'Nirmala' }).expect(401)
})

test('Should not update a user with invalid name', async () => {
  await request(app).post('/users')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send({
      name: '',
      email: 'sunguru98@yahoo.co.in',
      password: 'Sundeep1998'
    }).expect(406)
})

test('Should not update a user with invalid email', async () => {
  await request(app).post('/users')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send({
      name: 'Sundeep Charan',
      email: 'someemail@.com',
      password: 'Sundeep1998'
    }).expect(406)
})

test('Should not update a user with invalid password', async () => {
  await request(app).post('/users')
    .set('Authorization', `Bearer ${newUser.accessTokens[0].token}`)
    .send({
      name: 'Sundeep Charan',
      email: 'someemail@yahoo.com',
      password: 'Sun'
    }).expect(406)
})

test('Should not update invalid fields', async () => {
  await request(app).post('/users').send({
    location: 'Coimbatore'
  }).expect(406)
})