const express = require('express')
const router = express.Router()
const Task = require('../models/task') // Task model
const authenticate = require('../middleware/authenticate') // Authenticate middleware
// PUT RESPONSES
// -------------------------------------------------------------------------------------------------
// Update task
router.put('/tasks/:id', authenticate, async (req, res) => {
  // User can update only the following fields
  const updatableFields = ['description', 'isCompleted']
  // Receiving the body object as Array
  const receivedFields = Object.keys(req.body)
  // Run through each field and check if matches with the sent field
  const isValidField = receivedFields.every(field => updatableFields.includes(field))
  // Return 400 if no field matches
  if (!isValidField) return res.status(400).send({ message: 'Unknown/Disallowed field requested for updation' })

  try {
    const taskId = req.params.id
    if (taskId.length !== 24) return res.status(406).send({ message: 'Incorrect task id. Please try again' })
    // Checking both task id as well as the user id matches with current authenticated user id
    const task = await Task.findOne({ _id: taskId, user: req.user._id })
    if (!task) return res.status(404).send('Task not found')
    receivedFields.forEach(field => task[field] = req.body[field])
    await task.save()
    res.send(task)
  } catch (err) {
    err.name === 'CastError' ? res.status(406).send({ message: 'Incorrect task id. Please try again' }) : res.status(500).send({ message: err.message })
  }
})

// POST RESPONSES
// -------------------------------------------------------------------------------------------------
// Create task
router.post('/tasks', authenticate, async (req, res) => {
  const task = new Task({
    ...req.body, user: req.user._id
  }) // Passing request body to mongodb model
  console.log(task)
  try {
    const result = await task.save()
    // Adding new task id to authenticated user's tasks array
    req.user.tasks.push(result._id)
    await req.user.save()
    res.send(result)
  } catch (err) {
    res.status(406).send({ message: err.message })
  }
})

// GET RESPONSES
// -------------------------------------------------------------------------------------------------
// Fetch all tasks (authenticated user)
// Query strings given (completed, limit, page, sortBy)
router.get('/tasks', authenticate, async (req, res) => {
  const match = {}
  const sort = { order: 1 }
  // If there exists a 'completed' query string, then check if the string value is true
  // If true means, then create a new property under match obj to true, else set that to false
  if (req.query.completed) match.isCompleted = req.query.completed === 'true'
  if (req.query.sortBy && req.query.sortBy.split(':').length > 1) {
    let [property, order] = req.query.sortBy.split(':')
    order = order.toLowerCase()
    sort[property] = order === 'asc' ? 1 : -1
  } 
  try {
    const user = req.user
    const count = user.tasks.length
    // Bi-directional relationship between Task model and User model
    await user.populate({ 
      path: 'tasks', 
      match, 
      options: { 
        limit: parseInt(req.query.limit) || 10,
        skip: (parseInt(req.query.page) - 1) * (parseInt(req.query.limit) || 10) || 0,
        sort // For sorting
      } 
    }).execPopulate()
    res.send({ count, tasks: user.tasks })
  } catch (err) {
    res.send(500).send({ message: err.message })
  }
})

// Fetch task by id (authenticated user)
router.get('/tasks/:id', authenticate, async (req, res) => {
  let taskId = req.params.id
  if (taskId.length !== 24) return res.status(406).send({ message: 'Incorrect task id. Please try again' })
  try {
    // Checking both task id as well as the user id matches with current authenticated user id
    const task = await Task.findOne({ _id: taskId, user: req.user._id })
    task ? res.send(task) : res.status(404).send('Task not found')
  } catch (err) {
    err.name === 'CastError' ? res.status(406).send({ message: 'Incorrect task id. Please try again' }) : res.status(500).send({ message: err.message })
  }
})

// DELETE RESPONSES
// -------------------------------------------------------------------------------------------------
// Delete a task by its id
router.delete('/tasks/:id', authenticate, async (req, res) => {
  const taskId = req.params.id
  if (taskId.length !== 24) return res.status(406).send({ message: 'Incorrect task id. Please try again' })
  try {
    const task = await Task.findOne({ _id: taskId, user: req.user._id })
    if (!task) res.status(404).send({ message: 'Task not found' })
    task.remove()
    res.send(task)
  } catch (err) {
    err.name === 'CastError' ? res.status(406).send({ message: 'Incorrect task id. Please try again' }) : res.status(500).send({ message: err.message })
  }
})

module.exports = router