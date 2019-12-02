const models = require('../models');    // Import all models

const Account = models.Account;
const Event = models.Event;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const profilePage = (req, res) => {
  res.render('profile', { csrfToken: req.csrfToken() });
};

const notFound = (req, res) => {
  res.render('missing', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');  // Bring us back to login screen.
};

const login = (req, res) => {
  const rq = req;
  const rs = res;

  const username = `${rq.body.username}`;
  const password = `${rq.body.pass}`;

  if (!username || !password) return rs.status(400).json({ error: 'All fields are required' });
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) return rs.status(401).json({ error: 'Username or Password is incorrect' });
    rq.session.account = Account.AccountModel.toAPI(account);
    return rs.json({ redirect: '/home' });
  });
};

const signup = (req, res) => {
  const rq = req;
  const rs = res;
  rq.body.username = `${rq.body.username}`;
  rq.body.pass = `${rq.body.pass}`;
  rq.body.pass2 = `${rq.body.pass2}`;
  if (!rq.body.username || !rq.body.pass || !rq.body.pass2) {
    return rs.status(400).json({ error: 'All fields are required' });
  }
  if (rq.body.pass !== rq.body.pass2) {
    return rs.status(400).json({ error: 'Passwords do not match' });
  }
  return Account.AccountModel.generateHash(rq.body.pass, (salt, hash) => {
    const accountData = {
      username: rq.body.username,
      salt,
      password: hash,
    };
    const newAccount = new Account.AccountModel(accountData);
    newAccount.save()
            .then(() => {
              rq.session.account = Account.AccountModel.toAPI(newAccount);
              return rs.json({ redirect: '/home' });
            })
            .catch((err) => {
              if (err.code === 11000) {
                return rs.status(400).json({ error: 'This Username is already taken!' });
              }
              return rs.status(400).json({ error: 'An error occured' });
            });
  });
};

// Change the user password.
const changePassword = (req, res) => {
  // Check to see if we've provided password and password retyped
  if (!req.body.newPassword || !req.body.newPasswordAgain) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  // Check to see if the passwords match
  if (req.body.newPassword !== req.body.newPasswordAgain) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Get the user from the current session
  return Account.AccountModel.authenticate(req.session.account.username, req.body.current,
    (err, doc) => {
      if (err) return res.status(400).json({ error: err });
      const user = doc;
      // Generage a new hash with the new password
      return Account.AccountModel.generateHash(req.body.newPassword, (salt, hash) => {
        user.salt = salt;
        user.password = hash;
        return user.save().then(() => res.json({ message: 'Password Changed Successfully' }));
      });
    });
};


const getUser = (req, res) =>
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    if (err) return res.status(400).json({ error: 'Username not found' });
    return res.json({
      username: doc.username,
      events: doc.events,
      createdEvents: doc.createdEvents,
      notifications: doc.notifications,
    });
  });

const getToken = (request, response) => {
  const req = request;
  const res = response;
  const csrfToken = {
    csrfToken: req.csrfToken(),
  };
  res.json(csrfToken);
};

const deleteAccount = (req, res) => {
  Account.AccountModel.findByUsername(req.session.account.username, (userError, doc) => {
    if (userError) return res.status(400).json({ error: userError });
    if (doc.username !== req.session.account.username) {
      return res.status(500).json({ error: "You can't do that!" });
    }
    const user = doc;

    // Unregister for all of our events
    return Event.EventModel.updateMany(
      {},
      { $pull: { attendees: { $in: [req.session.account.username] } } },
      (err) => {
        if (err) return res.status(400).json({ error: err });
        // Make everyone attending our events to unregister for the event.
        return Event.EventModel.updateMany(
          { createdBy: user.username },
          { $set: { attendees: [] } },
          (aErr) => {
            if (aErr) return res.status(400).json({ error: aErr });
            // Delete every event we've made
            return Event.EventModel.deleteMany({ createdBy: doc.username }, () =>
              Account.AccountModel.deleteOne({ _id: user._id }, () => {
                req.session.destroy();
                res.json({ redirect: '/' });
              }));
          }
        );
      }
    );
  });
};

// Helper function for pushing a notification to a user.
const pushNotification = (req, res, user, message, eventId) =>
  Account.AccountModel.findByUsername(user, (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    const notif = {
      message,
      createdAt: new Date(),
      event: eventId,
    };
    return Account.AccountModel.updateOne(
      { _id: doc._id },
      { $push: { notifications: notif } },
      () => {
      }
    );
  });

const getNotifications = (req, res) =>
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    return res.json(doc.notifications);
  });

const clearNotifications = (req, res) => Account.AccountModel.updateOne(
    { _id: req.session.account._id },
    { $set: { notifications: [] } },
    (err) => {
      if (err) return res.status(400).json({ error: err });
      return res.json({ message: 'Notifications cleared.' });
    }
  );


module.exports.profilePage = profilePage;
module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.signup = signup;
module.exports.logout = logout;
module.exports.getToken = getToken;
module.exports.getUser = getUser;
module.exports.notFound = notFound;
module.exports.changePassword = changePassword;
module.exports.delete = deleteAccount;
module.exports.pushNotification = pushNotification;
module.exports.getNotifications = getNotifications;
module.exports.clearNotifications = clearNotifications;
