const express = require('express') // express
require('./db/mongoose') // mongo db connection
const userRouter = require('./routers/user') // User router
const taskRouter = require('./routers/task') // Task router

// Init server
const app = express()

// Say the server to parse the incoming requests as json
app.use(express.json())

// Connect all routes from individual files
app.use(userRouter)
app.use(taskRouter)

// Export server stored in 'app' variable
module.exports = app