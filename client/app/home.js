const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}</h1>
    );
};

const create = () => {

};

const register = (event, csrf, username) => {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, (data) => {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

// const deleteDomo = (domo) => {
//     sendAjax('POST', '/delete', domo, function() {
//         loadDomosFromServer();
//     });
// }


const EventList = (props) => {
    if(props.events.length === 0) {
        return (
            <div><h1>No Events Found.</h1></div>
        );
    }

    const events = props.events.map((event) => {
        let buttonText = "Register";
        let buttonClass = "buttonRegister";
        event.attendees.forEach((a) => {
            if(a === props.username)  {
                buttonText = "Going";
                buttonClass = "buttonGoing";
            }
        });
        return (
            <div key={event.id} className='event'>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1>{event.name}</h1>
                <p className='eventDate'>{event.date}</p>
                <p className='eventDesc'>{event.desc}</p>
                <input className={buttonClass} type='button' onClick={register.bind(this,event).bind(this,props.csrf).bind(this,props.username)} value={buttonText} />
                <p className='author'>{event.createdBy}</p>
            </div>
        );
    });
    return (
        <div className='eventList'>
            {events}
        </div>
    );
};

const loadEvents = (csrf, username) => {
    sendAjax('GET', '/events', null, (data) => {
        ReactDOM.render(
            <EventList events={data.events} csrf={csrf} username={username}/>,
            document.getElementById('events')
        );
    });
};

const setup = function(csrf) {
    let username = '';
    sendAjax('GET', '/user', null, (data) => {
        username = data.username;
        ReactDOM.render(
            <Greeting csrf={csrf} username={username}/>,
            document.getElementById('greeting')
        );
        loadEvents(csrf, username);
    });
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});