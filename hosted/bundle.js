const handleDomo = e => {
    e.preventDefault();
    $('#domoMessage').animate({ width: 'hide' }, 350);
    if ($('#domoName').val() == '' || $('#domoAge').val() == '' || $('#domoGold').val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }
    sendAjax('POST', $('#domoForm').attr('action'), $('#domoForm').serialize(), function () {
        loadDomosFromServer();
    });
    return false;
};

const DomoForm = props => {
    return React.createElement(
        'form',
        { id: 'domoForm', name: 'domoForm',
            onSubmit: handleDomo,
            action: '/maker',
            method: 'POST',
            className: 'domoForm'
        },
        React.createElement(
            'label',
            { htmlFor: 'name' },
            'Name: '
        ),
        React.createElement('input', { id: 'name', type: 'text', name: 'name', placeholder: 'Domo Name' }),
        React.createElement(
            'label',
            { htmlFor: 'age' },
            'Age: '
        ),
        React.createElement('input', { id: 'age', type: 'text', name: 'age', placeholder: 'Domo Age' }),
        React.createElement(
            'label',
            { htmlFor: 'gold' },
            'Gold: '
        ),
        React.createElement('input', { id: 'gold', type: 'text', name: 'gold', placeholder: 'Domo Gold' }),
        React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'makeDomoSubmit', type: 'submit', value: 'Make Domo' })
    );
};

const DomoList = function (props) {
    if (props.domos.length === 0) {
        return React.createElement(
            'div',
            { className: 'domoList' },
            React.createElement(
                'h3',
                { className: 'emptyDomo' },
                'No Domos Yet'
            )
        );
    }
    const domoNodes = props.domos.map(function (domo) {
        return React.createElement(
            'div',
            { key: domo._id, className: 'domo' },
            React.createElement('img', { src: '/assets/img/domoface.jpeg', alt: 'domo face', className: 'domoFace' }),
            React.createElement(
                'h3',
                { className: 'domoName' },
                'Name: ',
                domo.name
            ),
            React.createElement(
                'h3',
                { className: 'domoAge' },
                'Age: ',
                domo.age
            ),
            React.createElement(
                'h3',
                { className: 'domoGold' },
                'Gold: ',
                domo.gold
            ),
            React.createElement(
                'button',
                { onClick: deleteDomo.bind(this, domo) },
                'Delete'
            )
        );
    });
    return React.createElement(
        'div',
        { className: 'domoList' },
        domoNodes
    );
};

const deleteDomo = domo => {
    sendAjax('POST', '/delete', domo, function () {
        loadDomosFromServer();
    });
};

const loadDomosFromServer = () => {
    sendAjax('GET', '/getDomos', null, data => {
        console.log(data);
        ReactDOM.render(React.createElement(DomoList, { domos: data.domos }), document.querySelector('#domos'));
    });
};

const setup = function (csrf) {
    ReactDOM.render(React.createElement(DomoForm, { csrf: csrf }), document.querySelector('#makeDomo'));
    ReactDOM.render(React.createElement(DomoList, { domos: [] }), document.querySelector('#domos'));
    loadDomosFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, result => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
const handleError = message => {
    $('#errorMessage').text(message);
    $('#domoMessage').animate({ width: 'toggle' }, 350);
};

const redirect = response => {
    $('#domoMessage').animate({ width: 'hide' }, 350);
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
        error: function (xhr, status, error) {
            let messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
