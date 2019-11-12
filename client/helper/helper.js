const handleError = (message) => {
    console.log(message);
};

const redirect = (response) => {
    console.log(response);
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
    console.log(message);
    let toast = document.getElementById("snackbar");
    toast.innerHTML = message;
    toast.className = "show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

const close = (id) => {
    document.getElementById(id).innerHTML = "";
};