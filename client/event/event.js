const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}!</h1>
    );
};

const register = (event, csrf, username) => {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, (data) => {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

const Event = (props) => {
    let event = props.event;
    let buttonText = "Register";
    let buttonClass = "buttonRegister";
    let dateText = event.date.substring(0,event.date.indexOf('T'));
    let dateTimeText = `${dateText} | ${event.time}`;
    let eventClass = 'event';
    if(event.createdBy == props.username) {
        buttonText = "Created";
        buttonClass = "buttonCreated";
    } else {
        if(event.attendees.includes(props.username)) {
            buttonText = "Going";
            buttonClass = "buttonGoing";
        }
    }
    return (
        <div key={event._id} className={eventClass}>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1>{event.name}</h1>
                <p className='eventDate'>{dateTimeText}</p>
                <p className='eventDesc'>{event.desc}</p>
                <p className='eventComments'>{event.comments.length} comments</p>
                <p className='eventGoing'>{event.attendees.length} people going</p>
                <input disabled={event.createdBy === props.username} className={buttonClass} type='button' onClick={register.bind(this,event).bind(this,props.csrf).bind(this,props.username)} value={buttonText} />
                <p className='author'>By: {event.createdBy}</p>
        </div>
    );
};

const setup = function(setupData) {
    sendAjax('GET', '/user', null, (user) => {
        sendAjax('GET', '/event?id='+$('#id').val(), null, (result) => {
            ReactDOM.render(
                <Greeting csrf={setupData.csrfToken} username={user.username}/>,
                document.getElementById('greeting')
            );
            ReactDOM.render(
                <Event csrf={setupData.csrfToken} username={user.username} event={result} />,
                document.getElementById('event')
            );
        });
    });
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result);
    });
};

$(document).ready(function() {
    getToken();
});