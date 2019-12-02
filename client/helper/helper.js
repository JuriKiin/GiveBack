const handleError = (message) => {
    console.log(message);
};

const redirect = (response) => {
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
        error: function(xhr, status, error) {
            let messageObj = JSON.parse(xhr.responseText);
            showToast(messageObj.error);
        }
    });
};

const showToast = (message) => {
    let toast = document.getElementById("snackbar");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

const close = (id) => {
    document.getElementById(id).innerHTML = "";
    $('#createButton').css('display', 'inline');
    $('#modalBG').css('display','none');
    $('html, body').css({
        overflow: 'auto',
        height: 'auto'
    });
};

const loadEvent = (id) => {
    location.href = '/viewEvent?id='+id;
};

const toggleNotificationList = () => {
    console.log("TEST");
    if($('#notifications').css('display') === 'none'){
        sendAjax('GET', '/notifications', null, (d) => {
            ReactDOM.render(
                <NotificationList notifications={d}/>,
                document.getElementById('notifications')
            );
            $('#notifications').css('display', 'initial');
        });
    }
    else $('#notifications').css('display', 'none');
};

const clearNotifications = () => {
    sendAjax('GET', '/clearNotifications', null, () => {
        toggleNotificationList();
    });
}

const NotificationList = (props) => {
    if(props.notifications.length === 0) {
        return (
            <div>Nothing new.</div>
        );
    }
    
    const notifs = props.notifications.map((n) => {
        let dateText = n.createdAt.substring(0,n.createdAt.indexOf('T'));
        let dateTimeText = `${dateText} | ${n.createdAt.substring(11,n.createdAt.indexOf('Z')-7)}`;
        return (
            <div className="notification" onClick={loadEvent.bind(this,n.event)}>
                <h1>{n.message}</h1>
                <p>{dateTimeText}</p>
            </div>
        );
    });

    return (
        <div>
            {notifs}
            <button onClick={clearNotifications}>Clear</button>
        </div>
    );
};