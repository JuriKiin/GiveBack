const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}</h1>
    );
};

const create = () => {
    $('#searchButton').css('display','none');
    sendAjax('GET', '/getToken', null, (result) => {
        ReactDOM.render(
            <CreateForm csrf={result.csrfToken} />,
            document.getElementById('createModal')
        );
    });
};

const handleCreate = (e) => {
    e.preventDefault();
    if($('#name').val() == '' || $('#address').val() == '' || $('#desc').val() == '') {
        showToast("All fields are required");
        return false;
    }
    $('#searchButton').css('display','block');
    sendAjax('POST', $('#createForm').attr("action"), $('#createForm').serialize(), redirect);
};

const CreateForm = (props) => {
    return (
        <form id="createForm" name="createForm"
                onSubmit={handleCreate}
                action="/create"
                method="POST"
                className="createForm"
            >
            <h1>Create an event.</h1>
            <input id="name" type="text" name="name" placeholder="Event Name" />
            <input id="address" type="text" name="address" placeholder="Event Address" />
            <input type='date' name="date"/>
            <textarea placeholder="Event Description" id='desc' name="desc">

            </textarea>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="submit" type="submit" value="Create" />
            <button className="align-center" onClick={close.bind(this, 'createModal')}>Cancel</button>
        </form>
    );
};

const register = (event, csrf, username) => {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, (data) => {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

const EventList = (props) => {
    if(props.events.length === 0) {
        return (
            <div><h1 className="noEvents">No Events Found.</h1></div>
        );
    }

    const events = props.events.map((event) => {
        let buttonText = "Register";
        let buttonClass = "buttonRegister";
        if(event.createdBy == props.username) {
            buttonText = "Created";
            buttonClass = "buttonCreated";
        } else {
            event.attendees.forEach((a) => {
                if(a === props.username)  {
                    buttonText = "Going";
                    buttonClass = "buttonGoing";
                }
            });
        }
        let dateText = event.date.substring(0,event.date.indexOf('T'));
        return (
            <div key={event._id} className='event'>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1>{event.name}</h1>
                <p className='eventDate'>{dateText}</p>
                <p className='eventDesc'>{event.desc}</p>
                <input disabled={event.createdBy === props.username} className={buttonClass} type='button' onClick={register.bind(this,event).bind(this,props.csrf).bind(this,props.username)} value={buttonText} />
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

const Upcoming = (props) => {
    if(props.events.length === 0) {
        return (
            <div className="noUpcoming">No Upcoming Events</div>
        );
    }
    const events = props.events.map((event) => {
        let dateText = event.date.substring(0,event.date.indexOf('T'));
        return (
            <div key={event._id} className='upcomingEvent'>
                <h1>{event.name}</h1>
                <h2>{dateText}</h2>
                <button className="genericButton" onClick={register.bind(this,event).bind(this,props.csrf).bind(this,props.username)}>Unregister</button>
            </div>
        );
    });

    return (
        <div className="upcomingEvents">
            <h1 className="upcomingHeader">Upcoming Events</h1>
            {events}
        </div>
    )
};

const loadEvents = (csrf, username) => {
    sendAjax('GET', '/events', null, (data) => {
        //console.log(data);
        ReactDOM.render(
            <EventList events={data.events} csrf={csrf} username={username}/>,
            document.getElementById('events')
        );

        //Now get upcoming events
        sendAjax('GET','/events?sortBy=date', null, (upcoming) => {
            console.log(upcoming);
            ReactDOM.render(
                <Upcoming events={upcoming.events} csrf={csrf} username={username} />,
                document.getElementById('upcoming')
            )
        });
    });
};

const search = (e) => {
    //Get our token
    sendAjax('GET', '/getToken', null, (result) => {
        sendAjax('GET', '/user', null, (data) => {
            sendAjax('GET', `/events?name=${e.value}`, null, (events) => {
                if(events.events.length === 0) {
                    ReactDOM.render(
                        <div className="noEvents">No Events Found</div>,
                        document.getElementById('events')
                    );
                } else {
                    ReactDOM.render(
                        <EventList events={events.events} csrf={result.csrfToken} username={data.username} />,
                        document.getElementById('events')
                    );
                }
            });
        });
    });
};

const setup = function(csrf) {
    let username = '';
    sendAjax('GET', '/user', null, (data) => {
        //console.log(data);
        username = data.username;
        ReactDOM.render(
            <Greeting csrf={csrf} username={username}/>,
            document.getElementById('greeting')
        );
        loadEvents(csrf, username);
    });

    sendAjax('GET', '/events?sortBy=date', null, (data) => {
        console.log(data);
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