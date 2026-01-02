const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Store it even if not strictly verified in original
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
