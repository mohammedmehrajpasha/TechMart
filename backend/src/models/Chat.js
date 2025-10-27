const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Admin']
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    url: String,
    filename: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'closed'],
    default: 'waiting'
  },
  messages: [messageSchema],
  subject: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  rating: {
    score: Number,
    feedback: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema); 