const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'DATE', 'NUMBER', 'EMAIL'],
    required: true
  },
  label: { type: String, required: true },
  helpText: String,
  required: { type: Boolean, default: false },
  options: [String],
  orderIndex: Number,
  validation: {
    min: Number,
    max: Number,
    pattern: String
  }
});

const formSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  isPublished: { type: Boolean, default: false },
  allowPublicResponsesView: { type: Boolean, default: false },
  allowMultipleSubmissions: { type: Boolean, default: false },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', formSchema);
