const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let EventModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  date: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: String,
    trim: true,
    required: true,
  },
  attendees: {
    type: [String],
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

EventSchema.statics.toAPI = doc => ({
  // _id is built into your mongo document and is guaranteed to be unique
  name: doc.name,
  date: doc.date,
  address: doc.address,
  desc: doc.desc,
  createdBy: doc.createdBy,
  attendees: doc.attendees,
  _id: doc._id,
});

EventModel = mongoose.model('Event', EventSchema);

module.exports.EventModel = EventModel;
module.exports.EventSchema = EventSchema;
