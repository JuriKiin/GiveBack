'use strict';

$(document).ready(function () {
    getToken();
});

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
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

var Greeting = function Greeting(props) {
    return React.createElement(
        'h1',
        null,
        'Hello, ',
        props.username
    );
};

var loadEvents = function loadEvents(csrf, username) {
    sendAjax('GET', '/events?username=' + username, null, function (data) {
        ReactDOM.render(React.createElement(EventList, { events: data.events, csrf: csrf, username: username }), document.getElementById('events'));
    });
};

var deleteEvent = function deleteEvent(event, csrf, username) {
    console.log(event);
    event._csrf = csrf;
    sendAjax('POST', '/delete', event, function (data) {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

//REACT COMPONENTS

var EventList = function EventList(props) {
    if (props.events.length === 0) {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h1',
                { className: 'noEvents' },
                'You haven\'t made any events yet!'
            )
        );
    }
    var events = props.events.map(function (event) {
        return React.createElement(
            'div',
            { key: event.id, className: 'event' },
            React.createElement('img', { src: '/assets/img/eventIcon.png', alt: 'event', className: 'eventImage' }),
            React.createElement(
                'h1',
                null,
                event.name
            ),
            React.createElement(
                'p',
                { className: 'eventDate' },
                event.date
            ),
            React.createElement(
                'p',
                { className: 'eventDesc' },
                event.desc
            ),
            React.createElement('input', { className: 'deleteButton', type: 'button', onClick: deleteEvent.bind(undefined, event).bind(undefined, props.csrf).bind(undefined, props.username), value: 'Delete' }),
            React.createElement(
                'p',
                { className: 'author' },
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
