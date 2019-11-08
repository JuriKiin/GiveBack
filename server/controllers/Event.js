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
  createdDate: event.createdDate,
  date: event.date,
  desc: event.desc,
  name: event.name,
  _id: event._id,
});

const create = (req, res) => {
  if (!req.body.name || !req.body.date || !req.body.address || !req.body.desc) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const event = {
    name: req.body.name,
    date: req.body.date,
    address: req.body.address,
    desc: req.body.desc,
    attendees: [''],
    createdBy: req.session.account.username,
  };
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
          console.log('SAVED');
          return res.json({ redirect: '/home' });
        }).catch((er) => {
          console.log(`ERROR: ${er}`);
          res.json({ redirect: '/home' });
        });
      });
    });
};

const register = (req, res) => res.json({ message: 'Registered Successfully' });

module.exports.home = home;
module.exports.getEvents = getEvents;
module.exports.create = create;
module.exports.register = register;
