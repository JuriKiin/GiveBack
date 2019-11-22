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
  time: {
    type: String,
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
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    trim: true,
    required: true,
  },
  attendees: {
    type: [String],
  },
  comments: {
    type: [{
      username: String,
      time: String,
      comment: String,
    }],
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
  time: doc.time,
  address: doc.address,
  desc: doc.desc,
  isFeatured: doc.isFeatured,
  createdBy: doc.createdBy,
  attendees: doc.attendees,
  comments: doc.comments,
  _id: doc._id,
});

EventSchema.statics.findByID = (id, callback) => {
  const search = {
    _id: id,
  };

  return EventSchema.findOne(search, callback);
};

EventSchema.statics.findByUsername = (username, callback) => {
  const search = {
    createdBy: username,
  };
  return EventSchema.find(search, callback);
};


EventModel = mongoose.model('Event', EventSchema);

module.exports.EventModel = EventModel;
module.exports.EventSchema = EventSchema;
