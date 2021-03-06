'use strict';

var Greeting = function Greeting(props) {
    return React.createElement(
        'h1',
        null,
        'Hello, ',
        props.username,
        '!'
    );
};

var create = function create() {
    $('#modalBG').css('display', 'block');
    $('#createButton').css('display', 'none');
    $('html, body').css({
        overflow: 'hidden',
        height: '100%'
    });

    sendAjax('GET', '/getToken', null, function (result) {
        ReactDOM.render(React.createElement(CreateForm, { csrf: result.csrfToken }), document.getElementById('createModal'));
    });
};

var handleCreate = function handleCreate(e) {
    e.preventDefault();
    if ($('#name').val() == '' || $('#address').val() == '' || $('#desc').val() == '') {
        showToast("All fields are required");
        return false;
    }
    $('#searchButton').css('display', 'block');
    sendAjax('POST', $('#createForm').attr("action"), $('#createForm').serialize(), redirect);
};

var CreateForm = function CreateForm(props) {
    return React.createElement(
        'form',
        { id: 'createForm', name: 'createForm',
            onSubmit: handleCreate,
            action: '/create',
            method: 'POST',
            className: 'createForm'
        },
        React.createElement(
            'h1',
            null,
            'Create an event.'
        ),
        React.createElement('input', { id: 'name', type: 'text', name: 'name', placeholder: 'Event Name' }),
        React.createElement('input', { id: 'address', type: 'text', name: 'address', placeholder: 'Event Address' }),
        React.createElement('input', { type: 'date', name: 'date' }),
        React.createElement('input', { type: 'time', name: 'time' }),
        React.createElement('textarea', { placeholder: 'Event Description', id: 'desc', name: 'desc' }),
        React.createElement(
            'label',
            { 'for': 'isFeatured' },
            'Feature this Event? (You will be charged $5)'
        ),
        React.createElement('input', { type: 'checkbox', id: 'isFeatured', name: 'isFeatured' }),
        React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'submit', type: 'submit', value: 'Create' }),
        React.createElement(
            'button',
            { className: 'align-center', onClick: close.bind(undefined, 'createModal') },
            'Cancel'
        )
    );
};

var register = function register(event, csrf, username) {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, function (data) {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

var EventList = function EventList(props) {
    if (props.events.length === 0) {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h1',
                { className: 'noEvents' },
                'No Events Found.'
            )
        );
    }

    var sortedEvents = props.events.sort(function (a, b) {
        return a === b ? 0 : a ? -1 : 1;
    });

    var events = sortedEvents.map(function (event) {
        var buttonText = "Register";
        var buttonClass = "buttonRegister";
        var eventClass = "event";
        if (event.isFeatured) eventClass = "eventFeatured";
        if (event.createdBy == props.username) {
            buttonText = "Created";
            buttonClass = "buttonCreated";
        } else {
            if (event.attendees.includes(props.username)) {
                buttonText = "Going";
                buttonClass = "buttonGoing";
            }
        }
        var dateText = event.date.substring(0, event.date.indexOf('T'));
        var dateTimeText = dateText + ' | ' + event.time;

        return React.createElement(
            'div',
            { key: event._id, className: eventClass },
            React.createElement('img', { src: '/assets/img/eventIcon.png', alt: 'event', className: 'eventImage' }),
            React.createElement(
                'h1',
                { onClick: loadEvent.bind(undefined, event._id) },
                event.name
            ),
            React.createElement(
                'p',
                { className: 'eventDate' },
                dateTimeText,
                ' - ',
                event.address
            ),
            React.createElement(
                'p',
                { className: 'eventDesc' },
                event.desc
            ),
            React.createElement(
                'p',
                { className: 'eventComments' },
                event.comments.length,
                ' comments'
            ),
            React.createElement(
                'p',
                { className: 'eventGoing' },
                event.attendees.length,
                ' people going'
            ),
            React.createElement('input', { disabled: event.createdBy === props.username, className: buttonClass, type: 'button', onClick: register.bind(undefined, event).bind(undefined, props.csrf).bind(undefined, props.username), value: buttonText }),
            React.createElement(
                'p',
                { className: 'author' },
                'By: ',
                event.createdBy
            )
        );
    });
    return React.createElement(
        'div',
        { className: 'eventList' },
        events
    );
};

var Upcoming = function Upcoming(props) {
    if (props.events.length === 0) {
        return React.createElement(
            'div',
            { className: 'noUpcoming' },
            React.createElement(
                'h1',
                { className: 'upcomingHeader' },
                'Upcoming Events'
            ),
            React.createElement(
                'p',
                null,
                'No Upcoming Events'
            )
        );
    }
    var events = props.events.map(function (event) {
        var dateText = event.date.substring(0, event.date.indexOf('T'));
        var dateTimeText = dateText + ' | ' + event.time;
        return React.createElement(
            'div',
            { key: event._id, className: 'upcomingEvent' },
            React.createElement(
                'h1',
                null,
                event.name
            ),
            React.createElement(
                'h2',
                null,
                dateTimeText
            ),
            React.createElement(
                'button',
                { className: 'genericButton', onClick: register.bind(undefined, event).bind(undefined, props.csrf).bind(undefined, props.username) },
                'Unregister'
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'upcomingEvents' },
        React.createElement(
            'h1',
            { className: 'upcomingHeader' },
            'Upcoming Events'
        ),
        events
    );
};

var loadEvents = function loadEvents(csrf, username) {
    sendAjax('GET', '/events', null, function (data) {
        ReactDOM.render(React.createElement(EventList, { events: data.events, csrf: csrf, username: username }), document.getElementById('events'));

        //Now get upcoming events
        sendAjax('GET', '/events?sortBy=date', null, function (upcoming) {
            ReactDOM.render(React.createElement(Upcoming, { events: upcoming.events, csrf: csrf, username: username }), document.getElementById('upcoming'));
        });
    });
};

var search = function search(e) {
    //Get our token
    sendAjax('GET', '/getToken', null, function (result) {
        sendAjax('GET', '/user', null, function (data) {
            sendAjax('GET', '/events?name=' + e.value, null, function (events) {
                if (events.events.length === 0) {
                    ReactDOM.render(React.createElement(
                        'div',
                        { className: 'noEvents' },
                        'No Events Found'
                    ), document.getElementById('events'));
                } else {
                    ReactDOM.render(React.createElement(EventList, { events: events.events, csrf: result.csrfToken, username: data.username }), document.getElementById('events'));
                }
            });
        });
    });
};

var setup = function setup(csrf) {
    var username = '';
    sendAjax('GET', '/user', null, function (data) {
        username = data.username;
        ReactDOM.render(React.createElement(Greeting, { csrf: csrf, username: username }), document.getElementById('greeting'));
        loadEvents(csrf, username);
    });
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var handleError = function handleError(message) {
    console.log(message);
};

var redirect = function redirect(response) {
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: 'json',
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            showToast(messageObj.error);
        }
    });
};

var showToast = function showToast(message) {
    var toast = document.getElementById("snackbar");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(function () {
        toast.className = toast.className.replace("show", "");
    }, 3000);
};

var close = function close(id) {
    document.getElementById(id).innerHTML = "";
    $('#createButton').css('display', 'inline');
    $('#modalBG').css('display', 'none');
    $('html, body').css({
        overflow: 'auto',
        height: 'auto'
    });
};

var loadEvent = function loadEvent(id) {
    location.href = '/viewEvent?id=' + id;
};

var toggleNotificationList = function toggleNotificationList() {
    console.log("TEST");
    if ($('#notifications').css('display') === 'none') {
        sendAjax('GET', '/notifications', null, function (d) {
            ReactDOM.render(React.createElement(NotificationList, { notifications: d }), document.getElementById('notifications'));
            $('#notifications').css('display', 'initial');
        });
    } else $('#notifications').css('display', 'none');
};

var clearNotifications = function clearNotifications() {
    sendAjax('GET', '/clearNotifications', null, function () {
        toggleNotificationList();
    });
};

var NotificationList = function NotificationList(props) {
    if (props.notifications.length === 0) {
        return React.createElement(
            "div",
            null,
            "Nothing new."
        );
    }

    var notifs = props.notifications.map(function (n) {
        var dateText = n.createdAt.substring(0, n.createdAt.indexOf('T'));
        var dateTimeText = dateText + " | " + n.createdAt.substring(11, n.createdAt.indexOf('Z') - 7);
        return React.createElement(
            "div",
            { className: "notification", onClick: loadEvent.bind(undefined, n.event) },
            React.createElement(
                "h1",
                null,
                n.message
            ),
            React.createElement(
                "p",
                null,
                dateTimeText
            )
        );
    });

    return React.createElement(
        "div",
        null,
        notifs,
        React.createElement(
            "button",
            { onClick: clearNotifications },
            "Clear"
        )
    );
};
