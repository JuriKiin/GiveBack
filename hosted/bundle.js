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
            event.attendees.forEach(function (a) {
                if (a === props.username) {
                    buttonText = "Going";
                    buttonClass = "buttonGoing";
                }
            });
        }

        var dateText = event.date.substring(0, event.date.indexOf('T'));
        return React.createElement(
            'div',
            { key: event._id, className: eventClass },
            React.createElement('img', { src: '/assets/img/eventIcon.png', alt: 'event', className: 'eventImage' }),
            React.createElement(
                'h1',
                null,
                event.name
            ),
            React.createElement(
                'p',
                { className: 'eventDate' },
                dateText
            ),
            React.createElement(
                'p',
                { className: 'eventDesc' },
                event.desc
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
                dateText
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
        console.log(data);
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
        //console.log(data);
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
    console.log(response);
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
    console.log(message);
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
