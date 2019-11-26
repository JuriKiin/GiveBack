const Greeting = (props) => {
    return (
        <h1>Hello, {props.username}!</h1>
    );
};

//Lets the user register or unregister for this event.
const register = (event, csrf) => {
    event._csrf = csrf;
    sendAjax('POST', '/register', event, (data) => {
        showToast(data.message);
        setup({csrfToken: csrf});
    });
};

//This is the event page 
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
        <div key={event._id} className="eventPage">
                <h1>{event.name}</h1>
                <p className='eventDate'>When: {dateTimeText}</p>
                <p className='eventAddress'>Where: {event.address}</p>
                <p className='eventDesc'>What: {event.desc}</p>
                <input disabled={event.createdBy === props.username} className={buttonClass} type='button' onClick={register.bind(this,event).bind(this,props.csrf).bind(this,props.username)} value={buttonText} />
        </div>
    );
};

//This is the react component for the comments section
const Comments = (props) => {
    const comments = props.event.comments.map((comment) => {

        let title = '';
        let userClass = 'comment_user';
        if(comment.username === props.event.createdBy) {
            title = '[Organizer]';
            userClass = 'comment_user_organizer';
        }
        else if(props.event.attendees.includes(comment.username)) {
            title = '[Going]';
            userClass = 'comment_user_attendee';
        }

        return (
            <div className='comment'>
                <p className={userClass}>{comment.username} {title} - {comment.time}</p>
                <p className='comment_message'>{comment.comment}</p>
            </div>
        );
    });

    return (
        <div className="comments">
            <h1>Comments</h1>
            {comments}
        </div>
    )
};

//Make the call to comment on a post
const comment = (e) => {
    e.preventDefault();
    //Make sure we actually typed something.
    if($('#commentField').val() == '') {
        showToast("Comment field is empty.");
        return false;
    }
    //Make the API call.
    sendAjax($('#commentForm').attr("method"),$('#commentForm').attr("action"), $('#commentForm').serialize(), (data) => {
        $('#commentField').val('');
        getToken();
    });
};

//This component is the text-area and post button for comments
const AddComment = (props) => {
    return (
        <form id="commentForm" name="commentForm"
        onSubmit={comment}
        action="/comment"
        method="POST"
        className="commentForm"
        >
            <textarea name='comment' placeholder="Type your comment here" id='commentField'></textarea>
            <input type='hidden' name='id' value={props.event._id} />
            <input type="hidden" name='_csrf' value={props.csrf} />
            <input type='submit' value="Post"/>
        </form>
    );
};

const Attendees = (props) => {
    props.event.attendees.unshift(props.event.createdBy);
    const people = props.event.attendees.map((user) => {

        let title = '';
        let userClass = 'attendee';
        if(user === props.event.createdBy) {
            userClass = 'attendee_org';
            title = '- [Organizer]';
        }

        return (
            <div className={userClass}>{user} {title}</div>
        );
    });

    return (
        <div>
            <h1>Who's Going</h1>
            {people}
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
                <Event csrf={setupData.csrfToken} username={user.username} event={result}>
                </Event>,
                document.getElementById('event')
            );
            ReactDOM.render(
                <Comments csrf={setupData.csrfToken} event={result} username={user.username}/>,
                document.getElementById('comments')
            );
            ReactDOM.render(
                <AddComment csrf={setupData.csrfToken} event={result} />,
                document.getElementById('addcomment')
            );
            ReactDOM.render(
                <Attendees event={result} username={user.username}/>,
                document.getElementById('attendees')
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