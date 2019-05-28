// Import mongoose module
const { Schema, model } = require('mongoose')

const taskSchema = new Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    required: [true, 'User id is required'],
    ref: 'User'
  }
}, {
  timestamps: true // Enables created_at and updated_at fields
})

taskSchema.methods.toJSON = function () {
  const task = this.toObject()
  delete task.__v
  return task
}

const Task = model('Task', taskSchema)

module.exports = Task