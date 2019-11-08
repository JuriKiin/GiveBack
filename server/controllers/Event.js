const models = require('../models');    // Import all models
const Event = models.Event;
const Account = models.Account;

const home = (req, res) => res.render('app', { csrfToken: req.csrfToken() });

const getEvents = (req, res) => {
  Event.EventModel.find().select('').exec((err, docs) => {
    if (err) return res.json({ err });
    return res.json({ events: docs });
  });
};

const eventToObject = (event) => ({
  address: event.address,
  attendees: event.attendees,
  createdBy: event.createdBy,
  date: event.date,
  desc: event.desc,
  name: event.name,
});

const createEventFromReq = (body) => {
  console.log(body);
  return {
    name: body.name,
    date: body.date,
    address: body.address,
    desc: body.desc,
    attendees: [''],
    createdBy: '',
  };
}

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
        return user.save().then(() => {
          return res.json({ redirect: '/home' });
        }).catch((er) => {
          res.json({ redirect: '/home' });
        });
      });
    });
};

//Register for an event.
//Two things happen:
//1) Find current user, and add this event to their events []
//2) Find the event, and add the username to the list of attendees
const register = (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Invalid Event ID' });
  }

  Account.AccountModel.findByUsername(req.session.account.username, (err, user) => {
    if(err) return res.status(400).json({error: "User not found"});
    Event.EventModel.findById(req.body._id, (err, event) => {
      let userEvents = user.events.concat([createEventFromReq(event)]);
      user.events = userEvents;
      return user.save().then(() => {

        let attendees = event.attendees.concat([req.session.account.username]);
        event.attendees = attendees;

        return event.save().then(() => {
          res.json({redirect: '/home'});
        }).catch((err) => {
          console.log("EVENT SAVE :: " + err);
          res.json({redirect: '/home'});
        });
        
      }).catch((err) => {
        console.log("USER SAVE :: " + err);
        res.json({ redirect: '/home' });
      });
    });
  });


};



module.exports.home = home;
module.exports.getEvents = getEvents;
module.exports.create = create;
module.exports.register = register;
