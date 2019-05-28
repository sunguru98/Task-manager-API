// Import mongoose module
const mongoose = require('mongoose')

// Connect to mongoDb port 27017 (localhost)
// Use the options useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false for
  // i) Parsing the connection string properly
  // ii) Creating indexes to connect faster to the documents
  // iii) Not using deprecated findAndModify related methods

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .then(() => console.log('Database connected'))
  .catch(err => console.log('There seems to be a error in connecting the database. Please try again', err))
