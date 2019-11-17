const models = require('../models');    // Import all models

const Account = models.Account;
// const Event = models.Event;

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

  return res.json({redirect: "/logout"});

  Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    const user = doc;
    const events = user.events;
    const createdEvents = user.createdEvents;



    events.forEach(e => {
      const event = e;
      if (event.attendees.includes(req.session.account.username)) {
        const temp = event.attendees.filter(a => a !== req.session.account.username.toString());
        event.attendees = temp;
        event.save();
      }
    });

    return Account.AccountModel.find({ events: {
      $in: createdEvents,
    } }, (userError, userDocs) => {
      if (userError) return res.status(400).json({ error: userError });
      const users = userDocs;
      users.forEach(u => {
        const tempUser = u;
        for (let i = 0; i < createdEvents.length; i++) {
          if (u.events.includes(createdEvents[i].toString())) {
            const temp = u.events.filter(a => a !== createdEvents[i].toString());
            tempUser.events = temp;
            tempUser.save();
          }
        }
      });
      return Account.AccountModel.remove({ username: user.username },
          () => {
            console.log("DELETING");
            res.json({ redirect: '/logout' });
          })
    });
  });
};

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
