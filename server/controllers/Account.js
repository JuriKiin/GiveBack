const models = require('../models');    // Import all models
const global = require('../controllers/Global');
const consts = global.consts;

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

//This logs the user in.
const login = (req, res) => {
  const rq = req;
  const rs = res;

  const username = `${rq.body.username}`;
  const password = `${rq.body.pass}`;

  if (!username || !password) return rs.status(400).json({ error: consts.allFields });
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) return rs.status(401).json({ error: consts.wrongDetails });
    rq.session.account = Account.AccountModel.toAPI(account);
    return rs.json({ redirect: '/home' });
  });
};

//This creates a new user.
const signup = (req, res) => {
  const rq = req;
  const rs = res;
  rq.body.username = `${rq.body.username}`;
  rq.body.pass = `${rq.body.pass}`;
  rq.body.pass2 = `${rq.body.pass2}`;
  if (!rq.body.username || !rq.body.pass || !rq.body.pass2) {
    return rs.status(400).json({ error: consts.allFields });
  }
  if (rq.body.pass !== rq.body.pass2) {
    return rs.status(400).json({ error: consts.noMatch });
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
                return rs.status(400).json({ error: consts.usernameTaken });
              }
              return rs.status(400).json({ error: consts.error });
            });
  });
};

// Change the user password.
const changePassword = (req, res) => {
  // Check to see if we've provided password and password retyped
  if (!req.body.newPassword || !req.body.newPasswordAgain) {
    return res.status(400).json({ error: consts.allFields });
  }
  // Check to see if the passwords match
  if (req.body.newPassword !== req.body.newPasswordAgain) {
    return res.status(400).json({ error: consts.noMatch });
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
        return user.save().then(() => res.json({ message: consts.passwordChanged }));
      });
    });
};


const getUser = (req, res) =>
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    if (err) return res.status(400).json({ error: consts.usernameNotFound });
    return res.json({
      username: doc.username,
      events: doc.events,
      createdEvents: doc.createdEvents,
      notifications: doc.notifications,
    });
  });

//Get security token.
const getToken = (request, response) => {
  const req = request;
  const res = response;
  const csrfToken = {
    csrfToken: req.csrfToken(),
  };
  res.json(csrfToken);
};

//Delete user account.
const deleteAccount = (req, res) => {
  Account.AccountModel.findByUsername(req.session.account.username, (userError, doc) => {
    if (userError) return res.status(400).json({ error: userError });
    if (doc.username !== req.session.account.username) {
      return res.status(500).json({ error: consts.oops });
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

//This gets all notifications for a given user.
const getNotifications = (req, res) =>
  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    return res.json(doc.notifications);
  });

//This clears the notifications for a given user.
const clearNotifications = (req, res) => Account.AccountModel.updateOne(
  { _id: req.session.account._id },
  { $set: { notifications: [] } },
  (err) => {
    if (err) return res.status(400).json({ error: err });
    return res.json({ message: consts.clearNotifications });
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
