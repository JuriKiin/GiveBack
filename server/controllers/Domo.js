const models = require('../models');

const Domo = models.Domo;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) return res.status(400).json({ error: 'An error occured' });
    return res.render('app', { csrfToken: req.csrfToken(), domos: docs });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.gold) {
    return res.status(400).json({ error: 'Name, Age, and Gold are required' });
  }
  const domoData = {
    name: req.body.name,
    age: req.body.age,
    gold: req.body.gold,
    owner: req.session.account._id,
  };
  console.log(domoData);
  const newDomo = new Domo.DomoModel(domoData);
  return newDomo.save()
    .then(() => {
      console.log("In save promise");
      res.json({ redirect: '/maker' });
    })
    .catch((err) => {
      if (err.code === 11000) return res.status(400).json({ error: 'Domo already exists' });
      return res.status(400).json({ error: 'An error occured' });
    });
};

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if(err) return res.status(400).json({error: 'An error occured'});
    return res.json({domos: docs});
  });
};

const deleteDomo = (request, response) => {
  console.log("HERE");
  const req = request;
  const res = response;
  console.log(req.body);

  return Domo.DomoModel.findByOwner(req.body.)
};

module.exports.makerPage = makerPage;
module.exports.getDomos = getDomos;
module.exports.make = makeDomo;
module.exports.deleteDomo = deleteDomo;
