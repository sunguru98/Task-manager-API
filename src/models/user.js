const { Schema, model } = require('mongoose') // Mongoose module
const Task = require('../models/task') // Task model
const validator = require('validator') // Validator module
const bcrypt = require('bcrypt') // Hashing module (bcrypt)
const jwt = require('jsonwebtoken') // JSON Web Token

// Creating a Database Schema this is used to structure the data and have
// validation techniques etc. Schemas are like blueprints. They instruct how the data must be stored.

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    default: 0,
    validator(value) {
      if (value < 0) {
        throw new Error('Age must be greater than zero. DUH !')
      }
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error('Email is invalid. Please try again')
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password should not contain the word \'password\'')
      } else if (value.length <= 6) throw new Error('Password should be greater than 6 characters')
    }
  },
  accessTokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  tasks: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'Task'
  }],
  profilePic: {
    type: Buffer
  }
}, {
  timestamps: true // Enables created_at and updated_at fields
})

// Creating custom instance method generateAuthToken()
// NOTE :- We used function keyword instead of arrow function for binding the 'this' keyword to current user instance
userSchema.methods.generateAuthToken = async function () {
  const token = await jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' })
  this.accessTokens.push({ token })
  await this.save()
  return token
}

// Creating custom instance method toJSON()
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.accessTokens
  delete user.__v
  delete user.profilePic
  return user
}

// Creating custom model method findByEmail()
userSchema.statics.findByEmail = async (email, password) => {
  const user = await User.findOne({ email })
  if(!user) throw new Error('Incorrect email or password')
  const isMatched = await bcrypt.compare(password, user.password)
  if(!isMatched) throw new Error('Incorrect email or password')
  // If password matched return the user
  return user
}

// DATABASE MIDDLEWARE
// --------------------------------------------------
// 1) CONVERTING PLAIN TEXT PASSWORDS TO HASHED ONES
//    Only runs if save method is seen (pre means before 'name of method mentioned - here save()')
//    NOTE :- We used function keyword instead of arrow function for binding the 'this' keyword 
          // to current user instance
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try { this.password = await bcrypt.hash(this.password, 8) }
    catch (err) { console.log(err) }
  }
  next()
})

// 2) DELETING ALL TASKS RELATED TO AUTHENTICATED USER, WHEN USER IS REMOVED
//    Only runs if remove method is seen
userSchema.pre('remove', async function (next) {
  await Task.deleteMany({ user: this._id })
  next()
})

// ----------------------------------------------------
// Create a Data model which will use the schema and a table of model's name is created.
const User = model('User', userSchema)

module.exports = User
