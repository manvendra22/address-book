
$(document).ready(function () {
    let db = new PouchDB('contacts');

    db.changes({
        since: 'now',
        live: true
    }).on('change', showContacts);

    function showContacts() {
        db.allDocs({
            include_docs: true,
            descending: true
        }).then(function (result) {
            console.log(result)
            createContact(result.rows)
        }).catch(function (err) {
            console.log(err);
        });
    }

    function createContact(datas) {
        datas.forEach(data => {
            const { doc } = data
            const { firstName, lastName, contact, email } = doc

            let element = `<div class="list-item">
                                <img src="/icons/cross.svg" class="icon cross" alt="" srcset="">
                                <div class="data-container">
                                    <p>${firstName} ${lastName}</p>
                                    <p>${contact} (3 more)</p>
                                    <p>${email} (1 more)</p>
                                </div>
                                <div class="icons-container">
                                    <img src="/icons/eye.svg" class="icon" alt="" srcset="" data-toggle="modal" data-target="#contactViewModal">
                                    <img src="/icons/email.svg" class="icon" alt="" srcset="">
                                    <img src="/icons/call.svg" class="icon" alt="" srcset="">
                                </div>
                            </div>`

            $(element).appendTo('.list-container')
        })
    }

    $('form').submit(function (e) {
        e.preventDefault();
        let formData = $('form').serializeArray()

        $('#contactFormModal').modal('hide');

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

    // let emailElement = $('#emailElement').clone()
    // let contactElement = $('#contactElement').clone()

    // $('#addAnotherEmail').click(function () {
    //     $('#emailContainer').append(emailElement)
    // })

    // $('#addAnotherContact').click(function () {
    //     $('#contactElement').after(contactElement)
    // })
})

