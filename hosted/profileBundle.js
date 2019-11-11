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
        ReactDOM.render(React.createElement(EventList, { events: data.events, csrf: csrf, username: username }), document.getElementById('yourEvents'));
    });
};

var deleteEvent = function deleteEvent(event, csrf, username) {
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
            { className: 'noEvents' },
            React.createElement(
                'h1',
                null,
                'You haven\'t made any events yet!'
            ),
            React.createElement(
                'h2',
                null,
                'Want to create one?'
            ),
            React.createElement('input', { type: 'button', id: 'createButton', onClick: create.bind(undefined, props.username).bind(undefined, props.csrf), className: 'createButton', value: 'Create' })
        );
    }
    var events = props.events.map(function (event) {
        var dateText = event.date.substring(0, event.date.indexOf('T'));
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
                dateText
            ),
            React.createElement(
                'p',
                { className: 'eventDesc' },
                event.desc
            ),
            React.createElement('input', { className: 'author', type: 'button', onClick: edit.bind(undefined, event).bind(undefined, props.csrf), value: 'Edit' }),
            React.createElement('input', { className: 'deleteButton', type: 'button', onClick: deleteEvent.bind(undefined, event).bind(undefined, props.csrf).bind(undefined, props.username), value: 'Delete' })
        );
    });
    return React.createElement(
        'div',
        { className: 'eventList' },
        events
    );
};

var create = function create() {
    $('#searchButton').css('display', 'none');
    sendAjax('GET', '/getToken', null, function (result) {
        ReactDOM.render(React.createElement(CreateForm, { csrf: result.csrfToken }), document.getElementById('yourEvents'));
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

var handleEdit = function handleEdit(e) {
    e.preventDefault();
    if ($('#name').val() == '' || $('#address').val() == '' || $('#desc').val() == '') {
        showToast("All fields are required");
        return false;
    }
    sendAjax('POST', $('#createForm').attr("action"), $('#createForm').serialize(), redirect);
};

var CreateForm = function CreateForm(props) {

    if (props.event) {
        var dateText = props.event.date.substring(0, props.event.date.indexOf('T'));
        return React.createElement(
            'form',
            { id: 'createForm', name: 'createForm',
                onSubmit: handleEdit,
                action: '/edit',
                method: 'POST',
                className: 'createForm'
            },
            React.createElement(
                'h1',
                null,
                'Create an event.'
            ),
            React.createElement('input', { id: 'name', type: 'text', name: 'name', placeholder: 'Event Name', defaultValue: props.event.name }),
            React.createElement('input', { id: 'address', type: 'text', name: 'address', placeholder: 'Event Address', defaultValue: props.event.address }),
            React.createElement('input', { type: 'date', name: 'date', defaultValue: dateText }),
            React.createElement('textarea', { placeholder: 'Event Description', id: 'desc', name: 'desc', defaultValue: props.event.desc }),
            React.createElement('input', { type: 'hidden', name: '_csrf', defaultValue: props.csrf }),
            React.createElement('input', { type: 'hidden', name: '_id', defaultValue: props.event._id }),
            React.createElement('input', { className: 'submit', type: 'submit', defaultValue: 'Update' })
        );
    } else {
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
            React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
            React.createElement('input', { className: 'submit', type: 'submit', value: 'Create' })
        );
    }
};

var edit = function edit(event, csrf) {
    ReactDOM.render(React.createElement(CreateForm, { csrf: csrf, event: event }), document.getElementById('yourEvents'));
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
