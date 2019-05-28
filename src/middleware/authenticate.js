const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authenticate = async (req, res, next) => {
  try {
    // Receive the token
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) throw new Error()
    // Decode the received token
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY)
    // Find the user with the payload's id and the recieved token to check if user has been logged out or not
    const user = await User.findOne({ _id: payload._id, 'accessTokens.token': token })
    // No user found means, the sent token is either expired or manipulated
    if (!user) throw new Error()
    // Save the user object to req Mega object and for convenient logging out purposes, we also save the token itself
    req.user = user
    req.token = token
    // If all passes means direct towards the route
    next()
  } catch (err) {
    res.status(401).send({ message: 'Invalid authentication.'})
  }
}

module.exports = authenticate