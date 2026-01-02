const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  value: mongoose.Schema.Types.Mixed // string, number, array of strings, etc.
});

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  respondentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  answers: [answerSchema],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', responseSchema);
