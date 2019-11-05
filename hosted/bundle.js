var _this = this;

const Greeting = props => {
    return React.createElement(
        'h1',
        null,
        'Hello, ',
        props.username
    );
};

const create = () => {};

const register = (event, csrf, username) => {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, data => {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

// const deleteDomo = (domo) => {
//     sendAjax('POST', '/delete', domo, function() {
//         loadDomosFromServer();
//     });
// }


const EventList = props => {
    if (props.events.length === 0) {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h1',
                null,
                'No Events Found.'
            )
        );
    }

    const events = props.events.map(event => {
        let buttonText = "Register";
        let buttonClass = "buttonRegister";
        event.attendees.forEach(a => {
            if (a === props.username) {
                buttonText = "Going";
                buttonClass = "buttonGoing";
            }
        });
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
                event.date
            ),
            React.createElement(
                'p',
                { className: 'eventDesc' },
                event.desc
            ),
            React.createElement('input', { className: buttonClass, type: 'button', onClick: register.bind(_this, event).bind(_this, props.csrf).bind(_this, props.username), value: buttonText }),
            React.createElement(
                'p',
                { className: 'author' },
                event.createdBy
            )
        );
    });
    return React.createElement(
        'div',
        { className: 'eventList' },
        events
    );
};

const loadEvents = (csrf, username) => {
    sendAjax('GET', '/events', null, data => {
        ReactDOM.render(React.createElement(EventList, { events: data.events, csrf: csrf, username: username }), document.getElementById('events'));
    });
};

const setup = function (csrf) {
    let username = '';
    sendAjax('GET', '/user', null, data => {
        username = data.username;
        ReactDOM.render(React.createElement(Greeting, { csrf: csrf, username: username }), document.getElementById('greeting'));
        loadEvents(csrf, username);
    });
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
