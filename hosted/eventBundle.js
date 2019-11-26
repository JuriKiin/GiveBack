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
        setup({ csrfToken: csrf });
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
        { key: event._id, className: 'eventPage' },
        React.createElement(
            'h1',
            null,
            event.name
        ),
        React.createElement(
            'p',
            { className: 'eventDate' },
            'When: ',
            dateTimeText
        ),
        React.createElement(
            'p',
            { className: 'eventAddress' },
            'Where: ',
            event.address
        ),
        React.createElement(
            'p',
            { className: 'eventDesc' },
            'What: ',
            event.desc
        ),
        React.createElement('input', { disabled: event.createdBy === props.username, className: buttonClass, type: 'button', onClick: register.bind(undefined, event).bind(undefined, props.csrf).bind(undefined, props.username), value: buttonText })
    );
};

var Comments = function Comments(props) {
    var comments = props.event.comments.map(function (comment) {

        var title = '';
        var userClass = 'comment_user';
        if (comment.username === props.event.createdBy) {
            title = '[Organizer]';
            userClass = 'comment_user_organizer';
        } else if (props.event.attendees.includes(comment.username)) {
            title = '[Going]';
            userClass = 'comment_user_attendee';
        }

        return React.createElement(
            'div',
            { className: 'comment' },
            React.createElement(
                'p',
                { className: userClass },
                comment.username,
                ' ',
                title,
                ' - ',
                comment.time
            ),
            React.createElement(
                'p',
                { className: 'comment_message' },
                comment.comment
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'comments' },
        comments
    );
};

var comment = function comment(e) {
    e.preventDefault();
    if ($('#commentField').val() == '') {
        showToast("Comment field is empty.");
        return false;
    }
    sendAjax($('#commentForm').attr("method"), $('#commentForm').attr("action"), $('#commentForm').serialize(), function (data) {
        $('#commentField').val('');
        getToken();
    });
};

var AddComment = function AddComment(props) {
    return React.createElement(
        'form',
        { id: 'commentForm', name: 'commentForm',
            onSubmit: comment,
            action: '/comment',
            method: 'POST',
            className: 'commentForm'
        },
        React.createElement('textarea', { name: 'comment', placeholder: 'Type your comment here', id: 'commentField' }),
        React.createElement('input', { type: 'hidden', name: 'id', value: props.event._id }),
        React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { type: 'submit', value: 'Post' })
    );
};

var setup = function setup(setupData) {
    sendAjax('GET', '/user', null, function (user) {
        sendAjax('GET', '/event?id=' + $('#id').val(), null, function (result) {
            ReactDOM.render(React.createElement(Greeting, { csrf: setupData.csrfToken, username: user.username }), document.getElementById('greeting'));
            ReactDOM.render(React.createElement(
                Event,
                { csrf: setupData.csrfToken, username: user.username, event: result },
                React.createElement(Comments, { csrf: setup.csrfToken, event: result })
            ), document.getElementById('event'));
            ReactDOM.render(React.createElement(Comments, { csrf: setupData.csrfToken, event: result, username: user.username }), document.getElementById('comments'));
            ReactDOM.render(React.createElement(AddComment, { csrf: setupData.csrfToken, event: result }), document.getElementById('addcomment'));
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
