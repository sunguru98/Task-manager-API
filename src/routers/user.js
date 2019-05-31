const express = require('express')
const sharp = require('sharp') // Image resizing and convertion module
const User = require('../models/user') // User model
const router = express.Router() // Creating router
const multer = require('multer') // Multer module for file uploads
const authenticate = require('../middleware/authenticate') // Access token authentication middleware

// Upload specifications
const upload = multer({
  limits: {
    fileSize: 1000000 // 1 MB
  },
  fileFilter (req, file, callback) {
    // The regular expression is explained as follows
    // 1) Both forward slashes at front and back denote the start and end of that expression
    // 2) \ denotes to escape the '.' symbol as it is part of regex syntax
    // 3) .(jpg|png|jpeg)$ means that find either .jpg or .png or .jpeg but only at the end of the string
    // 4) $ denotes end of the string | denotes logical OR
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) return callback(new Error('File must be of type jpg, jpeg or png'))
    callback(undefined, true)
  }
})
// PUT RESPONSES
// -------------------------------------------------------------------------------------------------
// Update user
router.put('/user', authenticate, async (req, res) => {
  // User can update only the following fields
  const updatableFields = ['name', 'age', 'password', 'email']
  // Receiving the body object as Array
  const receivedFields = Object.keys(req.body)
  // Run through each field and check if matches with the sent field
  const isValidField = receivedFields.every(field => updatableFields.includes(field))
  // Return 400 if no field matches
  if (!isValidField) return res.status(406).send({ message: 'Unknown/Disallowed field requested for updation' })

  try {
    // Dynamically update the property's value using bracket notation
    receivedFields.forEach(field => req.user[field] = req.body[field])
    // Save the instance to Database
    req.user.save().then(updatedUser => res.send(updatedUser)).catch(err => { throw err })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// POST RESPONSES
// -------------------------------------------------------------------------------------------------
// Create user
router.post('/users', async (req, res) => { 
  const user = new User(req.body) // Passing request body to mongodb model
  try {
    const result = await user.save()
    const token = await result.generateAuthToken()
    res.send({ user: result, accessToken: `Bearer ${token}`, expires_in: '24h' })
  } catch (err) {
    err.code === 11000 ? res.status(406).send({ message: 'Email already exists' }) : res.status(406).send({ message: err.message })
  }
})

// Login user
router.post('/users/login', async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  try {
    // User defined model method (findByEmail())
    const user = await User.findByEmail(email, password)
    // User defined instance model (generateAuthToken())
    const accessToken = await user.generateAuthToken()
    res.send({ user, accessToken: `Bearer ${accessToken}`, expires_in: '24h' })
  } catch (err) { res.status(401).send({ message: err.message }) }
})

// Logout user from only one session (Wiping out the given accessToken)
router.post('/users/logout', authenticate, async (req, res) => {
  const user = req.user
  const token = req.token
  try {
    // Removing the token by filtering out the tokens array
    user.accessTokens = user.accessTokens.filter(accessToken => accessToken.token !== token)
    await user.save()
    res.send()
  } catch (err) {
    res.sendStatus(500)
  }
})

// Logout user from all sessions
router.post('/users/logoutAll', authenticate, (req, res) => {
  const user = req.user
  try {
    user.accessTokens = []
    user.save()
    res.send()
    console.log('Logged out from all devices')
  } catch (err) {
    res.sendStatus(500)
  }
})

// Upload profile picture
router.post('/user/profile', authenticate, upload.single('profilepic'), async (req, res) => {
  // Multer mixes the file data to req as req.file object (Buffer, size)
  try {
    const modifiedBuffer = await sharp(req.file.buffer).resize({ width: 256, height: 256, fit: 'inside' }).png().toBuffer()
    req.user.profilePic = modifiedBuffer
    await req.user.save()
    res.set('Content-type', 'image/png')
    res.send(req.user.profilePic)
  } catch (err) {
    res.set('Content-type', 'application/json')
    res.status(500).send({ message: 'Image parsing error. Please try again' })
  }
}, (err, req, res, next) => { // If any errors caught from multer middleware means, We can use here
  res.status(406).send({ message: err.message })
})

// GET RESPONSES
// -------------------------------------------------------------------------------------------------
// Fetch logged in user
router.get('/user', authenticate, async (req, res) => {
  res.send(req.user)
})

// Fetch user by id
router.get('/users/:id', async (req, res) => {
  // Fetching the id by route parameters
  let userId = req.params.id
  if (userId.length !== 24) return res.status(406).send({ message: 'Incorrect user id. Please try again' })
  try {
    const user = await User.findById(userId)
    user ? res.send({ user }) : res.status(404).send({ message: 'User not found' })
  } catch (err) {
    err.name === 'CastError' ? res.status(406).send({ message: 'Incorrect user id. Please try again' }) : res.status(500).send({ message: err.message })
  }
})

// Fetch User Profile Image
router.get('/user/profile', authenticate, async (req, res) => {
  res.set('Content-Type', 'image/png')
  if (!req.user.profilePic) {
    res.set('Content-Type', 'application/json')
    return res.status(404).send({ message: 'Profile picture not found' })
  }
  res.send(req.user.profilePic)
})

// DELETE RESPONSES
// -------------------------------------------------------------------------------------------------
// Delete authenticated user
router.delete('/user', authenticate, async (req, res) => {
  try {
    await req.user.remove()
    res.send({ user: req.user })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// Remove profile picture
router.delete('/user/profile', authenticate, async (req, res) => {
  try {
    req.user.profilePic = undefined
    await req.user.save()
    res.send(req.user)
  } catch (err) {
    res.status(500).send({ message: 'Image removal error. Please try again' })
  }
})

module.exports = router // Exporting that router