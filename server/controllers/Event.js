const models = require('../models');    // Import all models
const Event = models.Event;
const Account = models.Account;

const home = (req, res) => res.render('app', { csrfToken: req.csrfToken() });

const getEvents = (req, res) => {
  // If we pass in a username to the query, load events by user
  if (req.query.username) {
    Event.EventModel.find({createdBy: req.query.username}, (err, docs) => {
      if(err) return res.json({error: "No Events Found"});
      return res.json({events: docs});
    });
  } else {
    //Otherwise, just load all events
    //TODO :: Load events by zip code
    Event.EventModel.find().select('').exec((err, docs) => {
      if (err) return res.json({ err });
      return res.json({ events: docs });
    });
  }
};

//This takes in an event and casts it to a normal object
const eventToObject = (event) => ({
  address: event.address,
  attendees: event.attendees,
  createdBy: event.createdBy,
  date: event.date,
  desc: event.desc,
  name: event.name,
});

//This creates an event object from a req.body
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

//Create an event
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
        const pushEle = eventToObject(newEvent);
        const tempArr = user.createdEvents.concat([pushEle]);
        user.createdEvents = tempArr;
        return user.save().then(() => res.json({ message: 'Created Successfully' })).catch(() => {
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

      // If our user is in the list of attendees,
      if (event.attendees.includes(user.username)) {
        const newUserEvents = user.events;
        // Remove the event from our account object.
        for (let i = 0; i < newUserEvents.length; i++) {
          if (newUserEvents[i]._id === event._id) {
            newUserEvents.splice(i, 1);
          }
        }
        user.events = newUserEvents;  // Reset our user events.

        const newAttendeesList = event.attendees;
        // Remove the username from the event attendees
        for (let i = 0; i < newAttendeesList.length; i++) {
          if (newAttendeesList[i] === user.username) {
            newAttendeesList.splice(i, 1);
          }
        }
        event.attendees = newAttendeesList; // Reset the attendees.
      } else {
        // Add the event to the user.
        const userEvents = user.events.concat([createEventFromReq(event)]);
        user.events = userEvents;
        // Add the username to the attendees list.
        const attendees = event.attendees.concat([req.session.account.username]);
        event.attendees = attendees;
      }

      return user.save().then(() => {
        event.save().then(() =>
          res.json({ redirect: '/home' })
        ).catch(() =>
          res.json({ redirect: '/home' }));
      }).catch(() =>
        res.json({ redirect: '/home' }));
    });
  });
};


//Delete an event
const deleteEvent = (req, res) => {
  if(!req.body._id) return res.status(400).json({error: "Invalid Event. Try Again."});

  Account.AccountModel.findByUsername(req.session.account.username, (userError, userDoc) => {
    if(userError) return res.status(400).json({error: "Username not found"});

    Event.EventModel.findById(req.body._id, (eventError, eventDoc) => {
      if(eventError) return res.json({error: "No event found."});
      if(userDoc.username === eventDoc.createdBy) {
        return Event.EventModel.deleteOne({_id: doc._id}, () => {
          res.json({message: "Deleted Successfully"});
        });
      } else {
        res.json({error: "Event not associated with this account."});
      }
    });
  });
};

module.exports.home = home;
module.exports.getEvents = getEvents;
module.exports.create = create;
module.exports.register = register;
module.exports.delete = deleteEvent;
