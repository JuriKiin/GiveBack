const models = require('../models');    // Import all models
const controllers = require('../controllers');  // Import all controllers
const Event = models.Event;
const Account = models.Account;
const ActCtrl = controllers.Account;

const home = (req, res) => res.render('app', { csrfToken: req.csrfToken() });

const eventPage = (req, res) => {
  if (!req.query.id) return res.status(400).json({ error: 'Invalid event.' });
  return Event.EventModel.findById(req.query.id, (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    return res.render('event', {
      event: doc._id,
    });
  });
};

const getEventById = (req, res) => {
  if (!req.query.id) return res.status(400).json({ error: 'Invalid event.' });
  return Event.EventModel.findById(req.query.id, (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    return res.json(doc);
  });
};

const getEvents = (req, res) => {
  // If we pass in a username to the query, load events by user
  let limitSize = 0;
  if (req.query.limit) limitSize = req.query.limit;
  else limitSize = 10;

  let returnDocs = [];

  // Get a featured event first
  Event.EventModel.findOne({ isFeatured: true }, (doc) => {
    if (doc) returnDocs = returnDocs.concat([doc]);
  });

  if (req.query.sortBy) {
    if (req.query.sortBy === 'date') {
      Event.EventModel.find({ attendees: req.session.account.username.toString() })
        .exec((e, docs) => {
          if (e) return res.json({ error: e });
          returnDocs = returnDocs.concat(docs);
          return res.json({ events: returnDocs });
        });
    }
  } else if (req.query.username) {
    Event.EventModel.find({ createdBy: req.query.username }, (err, docs) => {
      if (err) return res.json({ error: 'No Events Found' });
      returnDocs = returnDocs.concat(docs);
      return res.json({ events: returnDocs });
    });
  } else if (req.query.name) {
    Event.EventModel.find({ name: { $regex: req.query.name, $options: 'i' } }, (err, docs) => {
      if (err) return res.json({ error: 'No Events Found' });
      returnDocs = returnDocs.concat(docs);
      return res.json({ events: returnDocs });
    }).limit(limitSize);
  } else {
    // Otherwise, just load all events
    // TODO :: Load events by zip code
    Event.EventModel.find().select('').limit(limitSize)
      .exec((err, docs) => {
        if (err) return res.json({ err });
        returnDocs = returnDocs.concat(docs);
        return res.json({ events: returnDocs });
      });
  }
};

// This creates an event object from a req.body
const createEventFromReq = (body) =>
   ({
     name: body.name,
     date: body.date,
     time: body.time,
     address: body.address,
     desc: body.desc,
     isFeatured: body.isFeatured,
     attendees: [],
     comments: [],
     createdBy: '',
     _id: body._id,
   });

// Create an event
const create = (req, res) => {
  if (!req.body.name || !req.body.date ||
      !req.body.address || !req.body.time || !req.body.desc) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const event = createEventFromReq(req.body);
  event.createdBy = req.session.account.username;
  const newEvent = new Event.EventModel(event);

  return newEvent.save()
    .then(() => {
      Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
        if (err) return res.status(400).json({ error: 'Username not found' });
        const user = doc;
        const tempArr = user.createdEvents.concat([newEvent._id.toString()]);
        user.createdEvents = tempArr;
        return user.save().then(() => res.json({ redirect: '/home' })).catch(() => {
          res.json({ message: 'Something went wrong' });
        });
      });
    });
};

// Register for an event.
// Two things happen:
// 1) Find current user, and add this event to their events []
// 2) Find the event, and add the username to the list of attendees
const register = (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Invalid Event ID' });
  }

  // Find the user
  return Account.AccountModel.findByUsername(req.session.account.username, (error, userDoc) => {
    if (error) return res.status(400).json({ error: 'User not found' });

    // Find the event
    return Event.EventModel.findById(req.body._id, (err, eventDoc) => {
      if (err) return res.status(400).json({ error: 'Event not found' });

      // Save the docs as variables.
      const user = userDoc;
      const event = eventDoc;
      let registeredMessage = 'Registered.';

      // If our user is in the list of attendees,
      if (event.attendees.includes(user.username)) {
        // Remove the event from our account object.
        if (user.events.includes(event._id.toString())) {
          registeredMessage = 'Unregistered.';
          const temp = user.events.filter(e => e !== event._id.toString());
          user.events = temp; // Reset our user events.
        }

        if (event.attendees.includes(user.username)) {
          const temp = event.attendees.filter(e => e !== user.username);
          event.attendees = temp;
        }
      } else {
        // Add the event to the user.
        const userEvents = user.events.concat([event._id.toString()]);
        user.events = userEvents;

        // Add the username to the attendees list.
        const attendees = event.attendees.concat([req.session.account.username]);
        event.attendees = attendees;
        // Send a notification to the author.
        ActCtrl.pushNotification(req, res, event.createdBy,
          `${req.session.account.username} registered for: ${event.name}`,
          event._id);
      }

      return user.save().then(() => {
        event.save().then(() =>
          res.json({ message: registeredMessage })
        ).catch(() =>
          res.json({ message: registeredMessage }));
      }).catch(() =>
        res.json({ message: registeredMessage }));
    });
  }).catch((err) => res.json({ error: err }));
};


// Delete an event
const deleteEvent = (req, res) => {
  if (!req.body._id) return res.status(400).json({ error: 'Invalid Event. Try Again.' });

  return Account.AccountModel.findByUsername(req.session.account.username, (userError, userDoc) => {
    if (userError) return res.status(400).json({ error: 'Username not found' });
    const user = userDoc;

    return Event.EventModel.findById(req.body._id, (eventError, eventDoc) => {
      if (eventError) return res.json({ error: 'No event found.' });

      // Only let user delete if they made it
      if (user.username === eventDoc.createdBy) {
        const tempAttendees = eventDoc.attendees;
        return Event.EventModel.updateMany(
          { _id: eventDoc._id },
          { $set: { attendees: [] } },
          (err) => {
            if (err) return res.status(400).json({ error: err });
            // Send a notification to all attendees that user cancelled the event.
            tempAttendees.forEach((a) => {
              ActCtrl.pushNotification(req, res, a,
                `${req.session.account.username} cancelled ${eventDoc.name}`,
                eventDoc._id);
            });

            return Account.AccountModel.updateOne(
              { _id: user._id },
              { $pull: { createdEvents: { $in: [eventDoc._id] } } },
              () => Event.EventModel.deleteOne({ _id: eventDoc._id }, () =>
                res.json({ message: 'Deleted Successfully' }))
            );
          }
        );
      }
      return res.status(400).json({ message: 'Access Denied' });
    });
  });
};

// Edit an existing event
const edit = (req, res) => {
  if (!req.body._id) return res.status(400).json({ error: 'Invalid Event. Try Again.' });

  // Find user
  return Account.AccountModel.findByUsername(req.session.account.username, (userError, userDoc) => {
    if (userError) return res.json({ error: userError });
    const user = userDoc; // Store the user

    return Event.EventModel.findById(req.body._id, (eventError, eventDoc) => {
      if (eventError) return res.json({ error: eventError });
      const event = eventDoc;

      // Check if our session's account is the same as the event's author (security)
      if (event.createdBy !== user.username) {
        return res.json({ error: 'Event not associated with this account.' });
      }

      // Make sure we have all valid fields
      if (!req.body.name || !req.body.address || !req.body.date || !req.body.desc) {
        return res.json({ error: 'All fields are required' });
      }

      event.name = req.body.name;
      event.address = req.body.address;
      event.date = req.body.date;
      event.desc = req.body.desc;

      return event.save().then(() => {
        // Send a notification to each attendee.
        event.attendees.forEach((a) => {
          ActCtrl.pushNotification(req, res, a,
            `${req.session.account.username} updated ${event.name}`,
            event._id);
        });
        return res.json({ redirect: '/profile', message: 'Event Updated.' });
      })
      .catch((err) => res.json({ redirect: '/profile', error: err }));
    });
  });
};

const comment = (req, res) => {
  if (!req.body.comment) return res.status(400).json({ error: 'Valid comment required.' });
  else if (!req.body.id) return res.status(400).json({ error: 'Valid event ID required.' });

  return Event.EventModel.findById(req.body.id, (err, doc) => {
    if (err) return res.status(400).json({ error: err });

    const event = doc;

    const newComment = {
      username: req.session.account.username,
      time: new Date().toLocaleString(),
      comment: req.body.comment,
    };
    return Event.EventModel.updateOne(
      { _id: req.body.id },
      { $push: { comments: newComment } },
      (e) => {
        if (e) return res.status(400).json({ error: e });
        ActCtrl.pushNotification(req, res, event.createdBy,
          `${req.session.account.username} commented on your event: ${event.name}`,
          event._id);
        return res.json({ message: 'Comment Posted.' });
      }
    );
  });
};

module.exports.home = home;
module.exports.getEvents = getEvents;
module.exports.create = create;
module.exports.register = register;
module.exports.delete = deleteEvent;
module.exports.edit = edit;
module.exports.eventPage = eventPage;
module.exports.event = getEventById;
module.exports.comment = comment;

