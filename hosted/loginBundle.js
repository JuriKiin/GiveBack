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
};
