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

//Lets the user register or unregister for this event.
var register = function register(event, csrf) {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, function (data) {
        showToast(data.message);
        setup({ csrfToken: csrf });
    });
};

//This is the event page 
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

//This is the react component for the comments section
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
        if (comment.username === props.username) {
            title += ' [You]';
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
        React.createElement(
            'h1',
            null,
            'Comments'
        ),
        comments
    );
};

//Make the call to comment on a post
var comment = function comment(e) {
    e.preventDefault();
    //Make sure we actually typed something.
    if ($('#commentField').val() == '') {
        showToast("Comment field is empty.");
        return false;
    }
    //Make the API call.
    sendAjax($('#commentForm').attr("method"), $('#commentForm').attr("action"), $('#commentForm').serialize(), function (data) {
        $('#commentField').val('');
        getToken();
    });
};

//This component is the text-area and post button for comments
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

var Attendees = function Attendees(props) {
    props.event.attendees.unshift(props.event.createdBy);
    var people = props.event.attendees.map(function (user) {

        var title = '';
        var userClass = 'attendee';
        if (user === props.event.createdBy) {
            userClass = 'attendee_org';
            title = '- [Organizer]';
        }

        return React.createElement(
            'div',
            { className: userClass },
            user,
            ' ',
            title
        );
    });

    return React.createElement(
        'div',
        null,
        React.createElement(
            'h1',
            null,
            'Who\'s Going'
        ),
        people
    );
};

var setup = function setup(setupData) {
    sendAjax('GET', '/user', null, function (user) {
        sendAjax('GET', '/event?id=' + $('#id').val(), null, function (result) {
            ReactDOM.render(React.createElement(Greeting, { csrf: setupData.csrfToken, username: user.username }), document.getElementById('greeting'));
            ReactDOM.render(React.createElement(Event, { csrf: setupData.csrfToken, username: user.username, event: result }), document.getElementById('event'));
            ReactDOM.render(React.createElement(Comments, { csrf: setupData.csrfToken, event: result, username: user.username }), document.getElementById('comments'));
            ReactDOM.render(React.createElement(AddComment, { csrf: setupData.csrfToken, event: result }), document.getElementById('addcomment'));
            ReactDOM.render(React.createElement(Attendees, { event: result, username: user.username }), document.getElementById('attendees'));
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
