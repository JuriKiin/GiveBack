const handleLogin = (e) => {
    e.preventDefault();

    if($("#user").val() == '' || $('#pass').val() == '') {
        showToast("Username or password is empty");
        return false;
    }
    sendAjax('POST', $('#loginForm').attr("action"), $('#loginForm').serialize(), redirect);
    return false;
};

const handleSignup = (e) => {
    e.preventDefault();
    if($('#user').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
        showToast("All fields are required");
        return false;
    }
    if($('#pass').val() !== $('#pass2').val()) {
        showToast("Passwords do not match");
        return false;
    }
    sendAjax('POST', $('#signupForm').attr("action"), $('#signupForm').serialize(), redirect);
    return false;
};

const LoginWindow = (props) => {
    document.getElementById("login-link").innerHTML = "Sign Up";
    document.getElementById("login-link").setAttribute('href', '/signup');
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
    document.getElementById("login-link").innerHTML = "Login";
    document.getElementById("login-link").setAttribute('href', '/login');
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
        if(document.getElementById('login-link').getAttribute('href') === '/login') {
            createLoginWindow(csrf);
        } else {
            createSignupWindow(csrf);
        }
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