let db = new PouchDB('contacts');

if (db) {
    fetchContacts()
}

db.changes({
    since: 'now',
    live: true
}).on('change', fetchContacts);

let contactData = []

function fetchContacts() {
    db.allDocs({
        include_docs: true,
        descending: true
    }).then(function (result) {
        console.log('Fetched ', result)
        contactData = result.rows
        showContacts()
    }).catch(function (err) {
        console.log(err);
    });
}

function showContacts(newData = contactData) {
    let elements = ''

    newData.forEach(data => {
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
                                <img src="/icons/eye.svg" class="icon eye" alt="" srcset="" data-id=${id}>
                                <img src="/icons/edit.svg" class="icon edit" alt="" srcset="" data-id=${id}>
                                <img src="/icons/email.svg" class="icon" alt="" srcset="">
                                <img src="/icons/call.svg" class="icon" alt="" srcset="">
                            </div>
                        </div>`

        elements += element
    })

    $('.list-container').html(elements)
}

function fillDataInViewModal(data) {
    const { firstName, lastName, contact, contactType, dob, email } = data

    $('#contactViewModal').modal('show');

    $("#view_name").text(`${firstName} ${lastName}`);
    $("#view_contact").text(contact);
    $("#view_contact_type").text(contactType);
    $("#view_dob").text(dob);
    $("#view_email").text(email);
}

function fillDataInEditModal(data) {
    const { firstName, lastName, contact, contactType, dob, email, _id, _rev } = data

    $("form").trigger("reset");
    $('#contactFormModal').modal('show');

    $("form").attr("data-id", _id);
    $("form").attr("data-rev", _rev);

    $("#first_name").val(firstName);
    $("#last_name").val(lastName);
    $("#contact").val(contact);
    $("#contact_type").val(contactType);
    $("#dob").val(dob);
    $("#email").val(email);

    $("#addData").text('Update')
}

function addContact() {
    $("form").trigger("reset");

    $("form").removeAttr("data-id");
    $("#addData").text('Add')

    $('#contactFormModal').modal('show');
}


function searchData(value) {

    let newData = contactData.filter(function (data) {
        let fullName = `${data.doc.firstName} ${data.doc.lastName}`
        fullName = fullName.toLowerCase()

        return fullName.includes(value)
    })

    showContacts(newData)
}

function sortData(type) {
    // type = firstName / lastName / dob

    contactData.sort(function (a, b) {

        let x = a.doc[type], y = b.doc[type]

        if (type == 'dob') {
            x = new Date(x)
            y = new Date(y)
        }

        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    })
    showContacts()
}

$(document).ready(function () {

    $(document).on('click', '.cross', function (e) {
        let id = $(this).attr("data-id")

        db.get(id).then(function (doc) {
            return db.remove(doc);
        }).then(function (result) {
            console.log('Deleted ', result)
        }).catch(function (err) {
            console.log(err);
        });
    })

    $(document).on('click', '.eye', function (e) {
        let id = $(this).attr("data-id")

        db.get(id).then(function (doc) {
            console.log('doc ', doc)
            fillDataInViewModal(doc)
        }).catch(function (err) {
            console.log(err);
        });
    })

    $(document).on('click', '.edit', function (e) {
        let id = $(this).attr("data-id")

        db.get(id).then(function (doc) {
            console.log('doc ', doc)
            fillDataInEditModal(doc)
        }).catch(function (err) {
            console.log(err);
        });
    })

    $('form').submit(function (e) {
        let id = $(this).attr("data-id")

        e.preventDefault();

        $('#contactFormModal').modal('hide');

        let formData = $('form').serializeArray()
        let jsonData = {};

        for (let i = 0; i < formData.length; i++) {
            jsonData[formData[i]['name']] = formData[i]['value'];
        }

        if (id) {
            let rev = $(this).attr("data-rev")
            jsonData._id = id
            jsonData._rev = rev
        } else {
            jsonData._id = new Date().toISOString()
        }

        db.put(jsonData).then(function (response) {
            console.log('Added ', response);
        }).catch(function (err) {
            console.log(err);
        });
    });

    $('#addAnotherEmail').click(function () {
        let element = ` <div class="form-group" id="emailElement">
                                <label for="email">Email</label>
                                <input type="email" maxlength="30" class="form-control" id="email" name="email"
                                    placeholder="john@doe.com">
                        </div>`
    })

    $('#addAnotherContact').click(function () {
        let element = ` <div class="form-row" id="contactElement">
                                <div class="col">
                                    <div class="form-group">
                                        <label for="contact">Contact</label>
                                        <input type="number" maxlength="13" class="form-control" id="contact"
                                            name="contact" placeholder="+91 98765 43210" required>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="form-group">
                                        <label for="contactType">Contact type</label>
                                        <select class="form-control" id="contact_type" name="contactType">
                                            <option>Home</option>
                                            <option>Office</option>
                                            <option>Personal</option>
                                        </select>
                                    </div>
                                </div>
                        </div>`
    })
})