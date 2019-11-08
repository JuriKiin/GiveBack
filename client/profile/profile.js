$(document).ready(function() {
    getToken();
});

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
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

const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}</h1>
    );
};

const loadEvents = (csrf, username) => {
    sendAjax('GET', `/events?username=${username}`, null, (data) => {
        ReactDOM.render(
            <EventList events={data.events} csrf={csrf} username={username}/>,
            document.getElementById('events')
        );
    });
};

const deleteEvent = (event, csrf, username) => {
    console.log(event);
    event._csrf = csrf;
    sendAjax('POST', '/delete', event, (data) => {
        showToast(data.message);
        loadEvents(csrf, username);
    });
}

//REACT COMPONENTS

const EventList = (props) => {
    if(props.events.length === 0) {
        return (
            <div><h1 className="noEvents">You haven't made any events yet!</h1></div>
        );
    }
    const events = props.events.map((event) => {
        return (
            <div key={event.id} className='event'>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1>{event.name}</h1>
                <p className='eventDate'>{event.date}</p>
                <p className='eventDesc'>{event.desc}</p>
                <input className="deleteButton" type='button' onClick={deleteEvent.bind(this,event).bind(this,props.csrf).bind(this, props.username)} value="Delete" />
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


