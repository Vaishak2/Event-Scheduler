// Event table for database
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Custom'], required: true },
  customFrequency: { type: String },
  exclusionDates: { type: [Date], default: [] },
});

module.exports = mongoose.model('Event', eventSchema);