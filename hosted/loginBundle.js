const handleLogin = e => {
    e.preventDefault();

    $('#domoMessage').animate({ width: 'hide' }, 350);
    if ($("#user").val() == '' || $('#pass').val() == '') {
        handleError("RAWR! Username or password is empty");
        return false;
    }
    console.log($('input[name=_csrf').val());
    sendAjax('POST', $('#loginForm').attr("action"), $('#loginForm').serialize(), redirect);
    return false;
};

const handleSignup = e => {
    e.preventDefault();
    $('#domoMessage').animate({ width: 'hide' }, 350);
    if ($('#user').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }
    if ($('#pass').val() !== $('#pass2').val()) {
        handleError("RAWR! Passwords do not match");
        return false;
    }
    sendAjax('POST', $('#signupForm').attr("action"), $('#signupForm').serialize(), redirect);
    return false;
};

const LoginWindow = props => {
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

const SignUpWindow = props => {
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

const createLoginWindow = csrf => {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector('#content'));
};

const createSignupWindow = csrf => {
    ReactDOM.render(React.createElement(SignUpWindow, { csrf: csrf }), document.querySelector('#content'));
};

const setup = csrf => {
    const loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', e => {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createSignupWindow(csrf);
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, result => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
const handleError = message => {
    $('#errorMessage').text(message);
    $('#domoMessage').animate({ width: 'toggle' }, 350);
};

const redirect = response => {
    $('#domoMessage').animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: 'json',
        success: success,
        error: function (xhr, status, error) {
            let messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
