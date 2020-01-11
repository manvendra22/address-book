
$(document).ready(function () {
    let db = new PouchDB('contacts');

    showContacts()

    db.changes({
        since: 'now',
        live: true
    }).on('change', showContacts);

    function showContacts() {
        db.allDocs({
            include_docs: true,
            descending: true
        }).then(function (result) {
            console.log('Fetched ', result)
            createContact(result.rows)
        }).catch(function (err) {
            console.log(err);
        });
    }

    function createContact(datas) {
        let elements = ''

        datas.forEach(data => {
            const { id, doc } = data
            const { firstName, lastName, contact, email } = doc

            let element = `<div class="list-item">
                        <img src="/icons/cross.svg" class="icon cross" alt="" srcset="" data-id=${id}>
                        <div class="data-container">
                            <p>${firstName} ${lastName}</p>
                            <p>${contact} (3 more)</p>
                            <p>${email} (1 more)</p>
                        </div>
                        <div class="icons-container">
                            <img src="/icons/eye.svg" class="icon" alt="" srcset="" data-id=${id} data-toggle="modal" data-target="#contactViewModal">
                            <img src="/icons/email.svg" class="icon" alt="" srcset="">
                            <img src="/icons/call.svg" class="icon" alt="" srcset="">
                        </div>
                     </div>`

            elements += element
        })

        $('.list-container').html(elements)
    }

    $(document).on('click', '.cross', function (e){
        let id = $(this).attr("data-id")
        
        db.get(id).then(function(doc) {
            return db.remove(doc);
          }).then(function (result) {
            console.log('Deleted ', result)
          }).catch(function (err) {
            console.log(err);
        });          
    })

    $('form').submit(function (e) {
        e.preventDefault();
        let formData = $('form').serializeArray()

        $('#contactFormModal').modal('hide');

        let jsonData = {};
        for (let i = 0; i < formData.length; i++) {
            jsonData[formData[i]['name']] = formData[i]['value'];
        }

        db.post(jsonData).then(function (response) {
            console.log('Added ', response);
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

