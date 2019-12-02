const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}!</h1>
    );
};

const create = () => {
    $('#modalBG').css('display','block');
    $('#createButton').css('display','none');
    $('html, body').css({
        overflow: 'hidden',
        height: '100%'
    });

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
            <input type='date' name="date" />
            <input type='time' name="time" />
            <textarea placeholder="Event Description" id='desc' name="desc">

            </textarea>
            <label for="isFeatured">Feature this Event? (You will be charged $5)</label>
            <input type="checkbox" id="isFeatured" name="isFeatured" />
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

    let sortedEvents = props.events.sort((a,b) => {
        return (a === b)? 0 : a? -1 : 1;
    });

    const events = sortedEvents.map((event) => {
        let buttonText = "Register";
        let buttonClass = "buttonRegister";
        let eventClass ="event";
        if(event.isFeatured) eventClass = "eventFeatured";
        if(event.createdBy == props.username) {
            buttonText = "Created";
            buttonClass = "buttonCreated";
        } else {
            if(event.attendees.includes(props.username)) {
                buttonText = "Going";
                buttonClass = "buttonGoing";
            }
        }
        let dateText = event.date.substring(0,event.date.indexOf('T'));
        let dateTimeText = `${dateText} | ${event.time}`;

        return (
            <div key={event._id} className={eventClass}>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1 onClick={loadEvent.bind(this,event._id)}>{event.name}</h1>
                <p className='eventDate'>{dateTimeText} - {event.address}</p>
                <p className='eventDesc'>{event.desc}</p>
                <p className='eventComments'>{event.comments.length} comments</p>
                <p className='eventGoing'>{event.attendees.length} people going</p>
                <input disabled={event.createdBy === props.username} className={buttonClass} type='button' onClick={register.bind(this,event).bind(this,props.csrf).bind(this,props.username)} value={buttonText} />
                <p className='author'>By: {event.createdBy}</p>
            </div>
        );
    });
    return (
        <div className='eventList'>
            {events}
        </div>
    );
};

const loadEvent = (id) => {
    location.href = '/viewEvent?id='+id;
};

const Upcoming = (props) => {
    if(props.events.length === 0) {
        return (
            <div className="noUpcoming">
                <h1 className="upcomingHeader">Upcoming Events</h1>
                <p>No Upcoming Events</p>
            </div>

        );
    }
    const events = props.events.map((event) => {
        let dateText = event.date.substring(0,event.date.indexOf('T'));
        let dateTimeText = `${dateText} | ${event.time}`;
        return (
            <div key={event._id} className='upcomingEvent'>
                <h1>{event.name}</h1>
                <h2>{dateTimeText}</h2>
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
        ReactDOM.render(
            <EventList events={data.events} csrf={csrf} username={username}/>,
            document.getElementById('events')
        );

        //Now get upcoming events
        sendAjax('GET','/events?sortBy=date', null, (upcoming) => {
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
        console.log(data);
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