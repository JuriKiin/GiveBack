const handleLogin = (e) => {
    e.preventDefault();

    $('#domoMessage').animate({width: 'hide'}, 350);
    if($("#user").val() == '' || $('#pass').val() == '') {
        handleError("RAWR! Username or password is empty");
        return false;
    }
    console.log($('input[name=_csrf').val());
    sendAjax('POST', $('#loginForm').attr("action"), $('#loginForm').serialize(), redirect);
    return false;
};

const handleSignup = (e) => {
    e.preventDefault();
    $('#domoMessage').animate({width: 'hide'}, 350);
    if($('#user').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }
    if($('#pass').val() !== $('#pass2').val()) {
        handleError("RAWR! Passwords do not match");
        return false;
    }
    sendAjax('POST', $('#signupForm').attr("action"), $('#signupForm').serialize(), redirect);
    return false;
};

const LoginWindow = (props) => {
    return (
    <form id="loginForm" name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
        <h1>Hello Again.</h1>
        <input id="user" type="text" name="username" placeholder="Username" />
        <input id="pass" type="password" name="pass" placeholder="Password" />
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="formSubmit" type="submit" value="Log In" />
    </form>
    );
};

const SignUpWindow = (props) => {
    return (
    <form id="signupForm" name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
        <h1>Let's Get Started.</h1>
        <input id="user" type="text" name="username" placeholder="Username" />
        <input id="pass" type="password" name="pass" placeholder="Password" />
        <input id="pass2" type="password" name="pass2" placeholder="Retype password" />
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="formSubmit" type="submit" value="Create Account" />
    </form>
    );
};

const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector('#content')
    );
};

const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <SignUpWindow csrf={csrf} />,
        document.querySelector('#content')
    );
};

const setup = (csrf) => {
    const loginButton = document.querySelector('#login-button');

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createSignupWindow(csrf);
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});