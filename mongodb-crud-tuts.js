const { MongoClient, ObjectID } = require('mongodb')

// Connection URL and Database name
const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'Task-Manager'

// Connecting to database Task-Manager
MongoClient.connect(connectionURL, {useNewUrlParser: true})
  .then(client => {
    const taskManagerDb = client.db(databaseName)
    // -----------------------------------------------------------
    // CREATE
    
    // taskManagerDb.collection('Users').insertOne({
    //   name: 'Sundeep Charan Ramkumar',
    //   age: 20,
    //   father_name: 'Ramkumar Murugaiyan',
    //   mother_name: 'Nirmala Ramkumar'
    // })
    //   .then(response => console.log(response.ops[0]))
    //   .catch(err => console.log(err))

    // taskManagerDb.collection('Tasks').insertMany([
    //   {
    //     description: 'To charge my phone',
    //     isCompleted: false
    //   },
    //   {
    //     description: 'To complete MongoDb Section',
    //     isCompleted: false
    //   },
    //   {
    //     description: 'To complete bugs in Vue.js project',
    //     isCompleted: true
    //   }
    // ])
    //   .then(response => console.log(response.ops))
    //   .catch(err => console.log(err))
    
    // -----------------------------------------------------------------------
    // RETRIEVE
    
    // taskManagerDb.collection('Tasks').findOne({ isCompleted: false })
    //   .then(task => console.log(task))
    //   .catch(err => console.log(err))
    
    // taskManagerDb.collection('Tasks').find({ isCompleted: false }).toArray()
    //   .then(tasks => console.log(tasks))
    //   .catch(err => console.log(err))
   
    // -----------------------------------------------------------------------
    // UPDATE

    // taskManagerDb.collection('Users').updateOne(
    //   { _id: new ObjectID("5ce4505e56409f0a2f8aef18") }, 
    //   { $set: { name: 'Sundeep Charan' } }
    // )
    //   .then(user => console.log(user))
    //   .catch(err => console.log(err))

    // taskManagerDb.collection('Tasks').updateMany(
    //   { isCompleted: false },
    //   { $set: { isCompleted: true } }
    // )
    //   .then(tasks => console.log(tasks))
    //   .catch(err => console.log(err))

    // -----------------------------------------------------------------------
    // DELETE

    // taskManagerDb.collection('Tasks').deleteOne(
    //   { description: "To charge my phone" }
    // ).then(res => console.log(res))
    //  .catch(err => console.log(err))

    // taskManagerDb.collection('Tasks').deleteMany({
    //     isCompleted: false
    //   })
    //   .then(res => console.log(res))
    //   .catch(err => console.log(err))

    // -------------------------------------------------------------------------
  })
  .catch((err) => console.log('Unable to connect', err))
