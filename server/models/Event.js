const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let EventModel = {};

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
    trim: true,
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

EventSchema.statics.findByID = (id, callback) => {
  const search = {
    _id: id,
  };

  return EventSchema.findOne(search, callback);
};


EventModel = mongoose.model('Event', EventSchema);

module.exports.EventModel = EventModel;
module.exports.EventSchema = EventSchema;
