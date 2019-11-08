const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/profile', mid.requiresLogin, controllers.Account.profilePage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/user', mid.requiresLogin, controllers.Account.getUser);
  app.get('/home', mid.requiresLogin, controllers.Event.home);
  app.get('/events', mid.requiresLogin, controllers.Event.getEvents);
  app.post('/register', mid.requiresLogin, controllers.Event.register);
  app.post('/create', mid.requiresLogin, controllers.Event.create);
  app.post('/delete', mid.requiresLogin, controllers.Event.delete);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
