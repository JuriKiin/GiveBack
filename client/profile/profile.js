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
            document.getElementById('yourEvents')
        );
    });
};

const deleteEvent = (event, csrf, username) => {
    event._csrf = csrf;
    sendAjax('POST', '/delete', event, (data) => {
        showToast(data.message);
        loadEvents(csrf, username);
    });
};

//REACT COMPONENTS

const EventList = (props) => {
    if(props.events.length === 0) {
        return (
            <div className="noEvents">
                <h1>You haven't made any events yet!</h1>
                <h2>Want to create one?</h2>
                <input type='button' id="createButton" onClick={create.bind(this,props.username).bind(this,props.csrf)} className="createButton" value="Create" />
            </div>
        );
    }
    const events = props.events.map((event) => {
        let dateText = event.date.substring(0,event.date.indexOf('T'));
        return (
            <div key={event.id} className='event'>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1>{event.name}</h1>
                <p className='eventDate'>{dateText}</p>
                <p className='eventDesc'>{event.desc}</p>
                <input className="author" type="button" onClick={edit.bind(this,event).bind(this,props.csrf)} value="Edit" />
                <input className="deleteButton" type='button' onClick={deleteEvent.bind(this,event).bind(this,props.csrf).bind(this, props.username)} value="Delete" />
            </div>
        );
    });
    return (
        <div className='eventList'>
            {events}
        </div>
    );
};


const create = () => {
    $('#searchButton').css('display','none');
    sendAjax('GET', '/getToken', null, (result) => {
        ReactDOM.render(
            <CreateForm csrf={result.csrfToken} />,
            document.getElementById('yourEvents')
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

const handleEdit = (e) => {
    e.preventDefault();
    if($('#name').val() == '' || $('#address').val() == '' || $('#desc').val() == '') {
        showToast("All fields are required");
        return false;
    }
    sendAjax('POST', $('#createForm').attr("action"), $('#createForm').serialize(), redirect);
};

const CreateForm = (props) => {

    if(props.event) {
        let dateText = props.event.date.substring(0,props.event.date.indexOf('T'));
        return (
            <form id="createForm" name="createForm"
                onSubmit={handleEdit}
                action="/edit"
                method="POST"
                className="createForm"
            >
                <h1>Create an event.</h1>
                <input id="name" type="text" name="name" placeholder="Event Name" defaultValue={props.event.name}/>
                <input id="address" type="text" name="address" placeholder="Event Address" defaultValue={props.event.address}/>
                <input type='date' name="date" defaultValue={dateText}/>
                <textarea placeholder="Event Description" id='desc' name="desc" defaultValue={props.event.desc}>

                </textarea>
                <input type="hidden" name="_csrf" defaultValue={props.csrf} />
                <input type="hidden" name="_id" defaultValue={props.event._id} />
                <input className="submit" type="submit" defaultValue="Update" />
            </form>
        );
    } else {
        return (
            <form id="createForm" name="createForm"
                onSubmit={handleCreate}
                action='/create'
                method="POST"
                className="createForm"
            >
                <h1>Create an event.</h1>
                <input id="name" type="text" name="name" placeholder="Event Name"/>
                <input id="address" type="text" name="address" placeholder="Event Address"/>
                <input type='date' name="date"/>
                <textarea placeholder="Event Description" id='desc' name="desc">
    
                </textarea>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input className="submit" type="submit" value="Create" />
            </form>
        );
    }
};

const edit = (event, csrf) => {
    ReactDOM.render(
        <CreateForm csrf={csrf} event={event} />,
        document.getElementById('yourEvents')
    );
};