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
        renderDelete(csrf);
        changePassword(csrf);
        loadEvents(csrf, username);
    });
};

const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}!</h1>
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

const handleChange = (e) => {
    e.preventDefault();
    if($('#current').val() == '' || $('#new1').val() == '' || $('#new2').val() == '') {
        showToast("All fields are required");
        return false;
    }
    sendAjax('POST', $('#password').attr("action"), $('#password').serialize(), (data) => {
        showToast(data.message);
    });
};

//REACT COMPONENTS

const EventList = (props) => {
    if(props.events.length === 0) {
        return (
            <div className="noEvents">
                <h1>You haven't made any events yet!</h1>
                <h2>Want to create one?</h2>
                <input type='button' id="createButton" onClick={create.bind(this,props.username).bind(this,props.csrf)} className="profileCreateButton" value="Create" />
            </div>
        );
    }
    const events = props.events.map((event) => {
        let dateText = event.date.substring(0,event.date.indexOf('T'));
        let dateTimeText = `${dateText} | ${event.time}`;
        return (
            <div key={event.id} className='event'>
                <img src='/assets/img/eventIcon.png' alt='event' className='eventImage' />
                <h1>{event.name}</h1>
                <p className='eventDate'>{dateTimeText}</p>
                <p className='eventDesc'>{event.desc}</p>
                <p className='eventComments'>{event.comments.length} comments</p>
                <p className='eventGoing'>{event.attendees.length} people going</p>
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
    $('#modalBG').css('display','block');
    $('#createButton').css('display','none');
    $('html, body').css({
        overflow: 'auto',
        height: 'auto'
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
                <input type='time' name="time" defaultValue={props.event.time} />
                <textarea placeholder="Event Description" id='desc' name="desc" defaultValue={props.event.desc}>

                </textarea>
                <input type="hidden" name="_csrf" defaultValue={props.csrf} />
                <input type="hidden" name="_id" defaultValue={props.event._id} />
                <input className="submit" type="submit" defaultValue="Update" />
                <button onClick={close.bind(this, 'createModal')}>Cancel</button>
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
                <input type='time' name="time"/>
                <textarea placeholder="Event Description" id='desc' name="desc">
    
                </textarea>
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input className="submit" type="submit" value="Create" />
                <button onClick={close.bind(this, 'createModal')}>Cancel</button>
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

const changePassword = (csrf) => {
    ReactDOM.render(
        <PasswordForm csrf={csrf} />,
        document.getElementById('passwordForm')
    );
};

const PasswordForm = (props) => {
    return (
        <form id="password" name="passwordForm"
            onSubmit={handleChange}
            action='/password'
            method="POST"
        >
            <h1 className="settingsSubHeader">Change Password:</h1>
            <input type="password" name="current" placeholder="Current Password" id='current'/>
            <input type="password" name="newPassword" placeholder="New Password" id='new1'/>
            <input type="password" name="newPasswordAgain" placeholder="Retype New Password" id='new2'/>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="buttonRegister" type="submit" value="Change" />
        </form>
    );
};

const renderDelete = (csrf) => {
    ReactDOM.render(
        <DeleteAccount csrf={csrf}/>,
        document.getElementById('deleteAccount')
    );
};

const DeleteAccount = (props) => {
    return (
        <form id="account" name="accountForm"
        onSubmit={showAccountDeleteConfirmPopup.bind(this,props.csrf)}
        action='/deleteAccount'
        method="POST"
    >
        <h1 className="settingsSubHeader">Delete Account:</h1>
        <input type="submit" className="deleteAccountButton" value="Delete Account" />
    </form>
    )
};

const AccountPopup = (props) => {
    return (
       <form id="confirm" name="confirmPopup"
        onSubmit={handleDeleteAccount}
        action='/deleteAccount'
        method="POST"
        className=""
        >
            <h1 className="settingsSubHeader">Delete Account:</h1>
            <p>Are you sure you want to delete your account?</p>
            <p>All of your events will be deleted.</p>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="submit" type="submit" value="Yes, Delete it." />
            <button onClick={close.bind(this, 'createModal')}>No, thanks.</button>
        </form>
    )
};

const showAccountDeleteConfirmPopup = (csrf, e) => {
    e.preventDefault();
    $('#modalBG').css('display', 'block');
    ReactDOM.render(
        <AccountPopup csrf={csrf} />,
        document.getElementById('createModal')
    );
};

const handleDeleteAccount = (e) => {
    e.preventDefault();
    sendAjax('POST', $('#confirm').attr("action"), $('#confirm').serialize(), redirect);
};

    //Show a popup
