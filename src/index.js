const app = require('./app')
const bcrypt = require('bcrypt')
// Port depending on build or production
const port = process.env.PORT

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
