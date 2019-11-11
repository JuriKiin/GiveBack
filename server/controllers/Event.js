const models = require('../models');    // Import all models
const Event = models.Event;
const Account = models.Account;

const home = (req, res) => res.render('app', { csrfToken: req.csrfToken() });

const getEvents = (req, res) => {
  // If we pass in a username to the query, load events by user
  let limitSize = 0;
  if (req.query.limit) limitSize = req.query.limit;
  else limitSize = 10;

  if(req.query.sortBy) {
    if(req.query.sortBy === "date") {

      Account.AccountModel.findByUsername(req.session.account.username, (err, userDoc) => {
        if(err) return res.json({error: err});
        let user = userDoc;

        Event.EventModel.find({attendees:req.session.account.username.toString()})
          .exec((e, docs) => {
            if(e) return res.json({error: e});
            return res.json({events: docs});
          });
      });
    }
  }

  else if (req.query.username) {
    Event.EventModel.find({ createdBy: req.query.username }, (err, docs) => {
      if (err) return res.json({ error: 'No Events Found' });
      return res.json({ events: docs });
    });
  } else if (req.query.name) {
    Event.EventModel.find({ name: { $regex: req.query.name, $options: 'i' } }, (err, docs) => {
      if (err) return res.json({ error: 'No Events Found' });
      return res.json({ events: docs });
    }).limit(limitSize);
  } else {
    // Otherwise, just load all events
    // TODO :: Load events by zip code
    Event.EventModel.find().select('').limit(limitSize)
      .exec((err, docs) => {
        if (err) return res.json({ err });
        return res.json({ events: docs });
      });
  }
};

// This creates an event object from a req.body
const createEventFromReq = (body) =>
   ({
     name: body.name,
     date: body.date,
     address: body.address,
     desc: body.desc,
     attendees: [''],
     createdBy: '',
     _id: body._id,
   });

// Create an event
const create = (req, res) => {
  if (!req.body.name || !req.body.date || !req.body.address || !req.body.desc) {
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
  Account.AccountModel.findByUsername(req.session.account.username, (error, userDoc) => {
    if (error) return res.status(400).json({ error: 'User not found' });

    // Find the event
    Event.EventModel.findById(req.body._id, (err, eventDoc) => {
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
      }

      return user.save().then(() => {
        event.save().then(() =>
          res.json({ message: registeredMessage })
        ).catch(() =>
          res.json({ message: registeredMessage }));
      }).catch(() =>
        res.json({ message: registeredMessage }));
    });
  });
};


// Delete an event
const deleteEvent = (req, res) => {
  if (!req.body._id) return res.status(400).json({ error: 'Invalid Event. Try Again.' });

  Account.AccountModel.findByUsername(req.session.account.username, (userError, userDoc) => {
    if (userError) return res.status(400).json({ error: 'Username not found' });
    const user = userDoc;

    Event.EventModel.findById(req.body._id, (eventError, eventDoc) => {
      if (eventError) return res.json({ error: 'No event found.' });

      // Only let user delete if they made it
      if (user.username === eventDoc.createdBy) {
        // Save the attendees and ID so we can use after we delete the event
        const attendees = eventDoc.attendees.filter(Boolean);
        const id = eventDoc._id;
        // Delete the event
        return Event.EventModel.deleteOne({ _id: eventDoc._id }, () => {
          // Upon completion of deleting the event,
          // Remove the event from the users createdEvents list
          if (user.createdEvents.includes(id.toString())) {
            const temp = user.createdEvents.filter(e => e !== id.toString());
            user.createdEvents = temp;
          }

          // Re-save the user
          user.save().then(() => {
            // Once the user is re-saved
            // Loop through the attendees to remove the event from their
            // Events list

            for (let i = 0; i < attendees.length; i++) {
              // Find the user
              Account.AccountModel.findByUsername(attendees[i], (err, doc) => {
                if (err) return res.json({ error: err });
                const tempUser = doc;

                if (tempUser.events.includes(id.toString())) {
                  const temp = tempUser.events.filter(e => e !== id.toString());
                  tempUser.events = temp;
                  tempUser.save();
                }
              });
            }
          }).catch((err) => res.json({ error: err }));
          res.json({ message: 'Deleted Successfully' });
        });
      }
      res.json({ error: 'Event not associated with this account.' });
    });
  });
};

// Edit an existing event
const edit = (req, res) => {
  if (!req.body._id) return res.status(400).json({ error: 'Invalid Event. Try Again.' });

  // Find user
  Account.AccountModel.findByUsername(req.session.account.username, (userError, userDoc) => {
    if (userError) return res.json({ error: userError });
    const user = userDoc; // Store the user

    Event.EventModel.findById(req.body._id, (eventError, eventDoc) => {
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
      event.save().then(() => res.json({ redirect: '/profile', message: 'Event Updated.' }))
      .catch((err) => res.json({ redirect: '/profile', error: err }));
    });
  });
};

module.exports.home = home;
module.exports.getEvents = getEvents;
module.exports.create = create;
module.exports.register = register;
module.exports.delete = deleteEvent;
module.exports.edit = edit;
