const handleLogin = e => {
    e.preventDefault();

    if ($("#user").val() == '' || $('#pass').val() == '') {
        showToast("Username or password is empty");
        return false;
    }
    sendAjax('POST', $('#loginForm').attr("action"), $('#loginForm').serialize(), redirect);
    return false;
};

const handleSignup = e => {
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

const LoginWindow = props => {
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

const SignUpWindow = props => {
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
        if (document.getElementById('login-link').getAttribute('href') === '/login') {
            createLoginWindow(csrf);
        } else {
            createSignupWindow(csrf);
        }
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
    console.log(message);
};

const redirect = response => {
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
            showToast(messageObj.error);
        }
    });
};

const showToast = message => {
    let toast = document.getElementById("snackbar");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(function () {
        toast.className = toast.className.replace("show", "");
    }, 3000);
};
