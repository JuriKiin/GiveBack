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

var register = function register(event, csrf, username) {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, function (data) {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

var Event = function Event(props) {
    var event = props.event;
    var buttonText = "Register";
    var buttonClass = "buttonRegister";
    var dateText = event.date.substring(0, event.date.indexOf('T'));
    var dateTimeText = dateText + ' | ' + event.time;
    var eventClass = 'event';
    if (event.createdBy == props.username) {
        buttonText = "Created";
        buttonClass = "buttonCreated";
    } else {
        if (event.attendees.includes(props.username)) {
            buttonText = "Going";
            buttonClass = "buttonGoing";
        }
    }
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
            dateTimeText
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
};

var setup = function setup(setupData) {
    sendAjax('GET', '/user', null, function (user) {
        sendAjax('GET', '/event?id=' + $('#id').val(), null, function (result) {
            ReactDOM.render(React.createElement(Greeting, { csrf: setupData.csrfToken, username: user.username }), document.getElementById('greeting'));
            ReactDOM.render(React.createElement(Event, { csrf: setupData.csrfToken, username: user.username, event: result }), document.getElementById('event'));
        });
    });
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result);
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
