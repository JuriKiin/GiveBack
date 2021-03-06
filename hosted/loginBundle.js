'use strict';

var handleLogin = function handleLogin(e) {
    e.preventDefault();

    if ($("#user").val() == '' || $('#pass').val() == '') {
        showToast("Username or password is empty");
        return false;
    }
    sendAjax('POST', $('#loginForm').attr("action"), $('#loginForm').serialize(), redirect);
    return false;
};

var handleSignup = function handleSignup(e) {
    e.preventDefault();
    if ($('#user').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
        showToast("All fields are required");
        return false;
    }
    if ($('#pass').val() !== $('#pass2').val()) {
        showToast("Passwords do not match");
        return false;
    }
    sendAjax('POST', $('#signupForm').attr("action"), $('#signupForm').serialize(), redirect);
    return false;
};

var LoginWindow = function LoginWindow(props) {
    document.getElementById("login-link").innerHTML = "Sign Up";
    document.getElementById("login-link").setAttribute('href', '/signup');
    return React.createElement(
        'form',
        { id: 'loginForm', name: 'loginForm',
            onSubmit: handleLogin,
            action: '/login',
            method: 'POST',
            className: 'mainForm'
        },
        React.createElement(
            'h1',
            null,
            'Hello Again.'
        ),
        React.createElement('input', { id: 'user', type: 'text', name: 'username', placeholder: 'Username' }),
        React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'Password' }),
        React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Log In' })
    );
};

var SignUpWindow = function SignUpWindow(props) {
    document.getElementById("login-link").innerHTML = "Login";
    document.getElementById("login-link").setAttribute('href', '/login');
    return React.createElement(
        'form',
        { id: 'signupForm', name: 'signupForm',
            onSubmit: handleSignup,
            action: '/signup',
            method: 'POST',
            className: 'mainForm'
        },
        React.createElement(
            'h1',
            null,
            'Let\'s Get Started.'
        ),
        React.createElement('input', { id: 'user', type: 'text', name: 'username', placeholder: 'Username' }),
        React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'Password' }),
        React.createElement('input', { id: 'pass2', type: 'password', name: 'pass2', placeholder: 'Retype password' }),
        React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'formSubmit', type: 'submit', value: 'Create Account' })
    );
};

var createLoginWindow = function createLoginWindow(csrf) {
    $('#modalBG').css('display', 'block');
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector('#content'));
};

var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignUpWindow, { csrf: csrf }), document.querySelector('#content'));
};

var setup = function setup(csrf) {
    var loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (document.getElementById('login-link').getAttribute('href') === '/login') {
            createLoginWindow(csrf);
        } else {
            createSignupWindow(csrf);
        }
        return false;
    });

    createSignupWindow(csrf);
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
