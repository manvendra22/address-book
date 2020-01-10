
$(document).ready(function () {
    let db = new PouchDB('contacts');

    db.changes({
        since: 'now',
        live: true
    }).on('change', showTodos);

    function showTodos() {
        db.allDocs({
            include_docs: true,
            descending: true
        }).then(function (result) {
            console.log(result)
        }).catch(function (err) {
            console.log(err);
        });
    }

    $('form').submit(function (e) {
        e.preventDefault();
        let formData = $('form').serializeArray()

        let jsonData = {};
        for (let i = 0; i < formData.length; i++) {
            jsonData[formData[i]['name']] = formData[i]['value'];
        }

        db.post(jsonData).then(function (response) {
            console.log('Success ', response);
        }).catch(function (err) {
            console.log(err);
        });
    });

    let emailElement = $('#emailElement').clone()
    let contactElement = $('#contactElement').clone()

    $('#addAnotherEmail').click(function () {
        $('#emailContainer').append(emailElement)
    })

    $('#addAnotherContact').click(function () {
        $('#contactElement').after(contactElement)
    })
})
