const models = require('../models');    // Import all models
const Event = models.Event;

const home = (req, res) => {
    return res.render('app', { csrfToken: req.csrfToken()});
};

const getEvents = (req, res) => {
    return res.json({
        events: [
            {
                name: "Test Event",
                createdBy: "jurikiin",
                date: new Date(),
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque luctus tortor eu elit gravida, vel pulvinar diam ultricies. Donec sed mi vitae mauris condimentum vulputate. Mauris velit erat, faucibus ac ipsum quis, blandit euismod lacus. Vestibulum et finibus arcu. Duis purus arcu, faucibus quis sapien eu, luctus tincidunt lorem. Integer id porttitor ante, et consequat lacus",
                attendees: [
                    "nd11",
                    "Boomer",
                    "Sammi",
                ],
                createdDate: Date.now
            },
            {
                name: "Event 2",
                createdBy: "nd11",
                date: new Date(),
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque luctus tortor eu elit gravida, vel pulvinar diam ultricies. Donec sed mi vitae mauris condimentum vulputate. Mauris velit erat, faucibus ac ipsum quis, blandit euismod lacus. Vestibulum et finibus arcu. Duis purus arcu, faucibus quis sapien eu, luctus tincidunt lorem. Integer id porttitor ante, et consequat lacus",
                attendees: [
                    "nd11",
                    "Boomer",
                    "Sammi"
                ],
                createdDate: Date.now
            }
        ],
    });
};

const register = (req, res) => {
    console.log("HERE");
    return res.json({message: "Registered Successfully"});
};

const create = (req, res) => {
    return res.json({message: "Created"});
};

module.exports.home = home;
module.exports.getEvents = getEvents;
module.exports.create = create;
module.exports.register = register;
