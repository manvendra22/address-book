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
        const { firstName, lastName, contacts, emails } = doc

        // TODO: Length of Emails & Contacts

        let element = `<div class="list-item">
                            <img src="/icons/cross.svg" class="icon cross" alt="" srcset="" data-id=${id}>
                            <div class="data-container">
                                <p>${firstName} ${lastName}</p>
                                <p>${contacts[0].value} (${contacts.length / 2 - 1} more)</p>
                                <p>${emails[0].value} (${emails.length - 1} more)</p>
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
    const { firstName, lastName, dob, contacts, emails } = data

    $('#contactViewModal').modal('show');

    $("#view_name").text(`${firstName} ${lastName}`);
    $("#view_dob").text(dob);

    contacts.forEach(contact => {
        if (contact.name.includes('contactType')) {
            let contactTypeElement = `<div>${contact.value}</div>`
            $('#view_contact_type_container').append(contactTypeElement)
        } else {
            let contactElement = `<div>${contact.value}</div>`
            $('#view_contact_container').append(contactElement)
        }
    })

    emails.forEach(email => {
        let elementEmail = `<div>${email.value}</div>`

        $('#view_email_container').append(elementEmail)
    })

}

function fillDataInEditModal(data) {
    const { firstName, lastName, contacts, dob, emails, _id, _rev } = data

    $("form").trigger("reset");
    $('#contactFormModal').modal('show');

    $("form").attr("data-id", _id);
    $("form").attr("data-rev", _rev);

    $("#firstName").val(firstName);
    $("#lastName").val(lastName);
    $("#dob").val(dob);
    $("#addData").text('Update')

    let contactElement = null, contactTypeElement = null;

    $('#contactContainer').html(null)
    $('#emailContainer').html(null)

    contacts.forEach(contact => {

        if (contact.name.includes('contactType')) {
            contactTypeElement = `<div class="form-group">
                                        <label for=${contact.name}>Contact type</label>
                                        <select class="form-control" id=${contact.name} name=${contact.name} value=${contact.value}>
                                            <option>Home</option>
                                            <option>Office</option>
                                            <option>Personal</option>
                                        </select>
                                    </div>`

        } else {
            contactElement = `<div class="form-group">
                                <label for=${contact.name}>Contact</label>
                                <input type="number" maxlength="13" class="form-control" id=${contact.name}
                                    name=${contact.name} placeholder="+91 98765 43210" required value=${contact.value}>
                            </div>`
        }

        if (contactTypeElement && contactElement) {
            let elementContact = ` <div class="form-row">
                                <div class="col">
                                    ${contactElement}
                                </div>
                                <div class="col">
                                    ${contactTypeElement}
                                </div>
                            </div>`

            $('#contactContainer').append(elementContact)

            contactTypeElement = null, contactElement = null
        }
    })

    emails.forEach(email => {
        let elementEmail = ` <div class="form-group">
                                <label for=${email.name}>Email</label>
                                <input type="email" maxlength="30" class="form-control" id=${email.name} name=${email.name}
                                    placeholder="john@doe.com" value=${email.value}>
                            </div>`

        $('#emailContainer').append(elementEmail)
    })
}

function addContact() {
    $("form").trigger("reset");

    $("form").removeAttr("data-id");
    $("#addData").text('Add')

    $('#contactFormModal').modal('show');

    let emailElement = `<div class="form-group">
                                    <label for="email_1">Email</label>
                                    <input type="email" maxlength="30" class="form-control" id="email_1" name="email_1"
                                        placeholder="john@doe.com">
                            </div>`

    let contactElement = `<div class="form-row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="contact_1">Contact</label>
                                            <input type="number" maxlength="13" class="form-control" id="contact_1"
                                                name="contact_1" placeholder="+91 98765 43210" required>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="contactType_1">Contact type</label>
                                            <select class="form-control" id="contactType_1" name="contactType_1">
                                                <option>Home</option>
                                                <option>Office</option>
                                                <option>Personal</option>
                                            </select>
                                        </div>
                                    </div>
                            </div>`

    $('#contactContainer').html(contactElement)
    $('#emailContainer').html(emailElement)
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

    $('#contactViewModal').on('hide.bs.modal', function (e) {
        $('#view_contact_container').html(null)
        $('#view_contact_type_container').html(null)
        $('#view_email_container').html(null)
    })

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

        let formData = $('form').serializeArray();
        let jsonData = {}, contacts = [], emails = [];

        console.log('formData ', formData)

        formData.forEach(data => {
            if (data['name'].includes('contact')) {
                contacts.push(data)
            } else if (data['name'].includes('email')) {
                emails.push(data)
            } else {
                jsonData[data['name']] = data['value'];
            }
        })

        jsonData.contacts = contacts;
        jsonData.emails = emails;

        // for (let i = 0; i < formData.length; i++) {
        //     jsonData[formData[i]['name']] = formData[i]['value'];
        // }

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
        let emailContainer = $('#emailContainer').children()
        let length = emailContainer.length

        let element = ` <div class="form-group">
                                <label for="email_${length + 1}">Email</label>
                                <input type="email" maxlength="30" class="form-control" id="email_${length + 1}" name="email_${length + 1}"
                                    placeholder="john@doe.com">
                        </div>`

        $('#emailContainer').append(element)
    })

    $('#addAnotherContact').click(function () {
        let contactContainer = $('#contactContainer').children()
        let length = contactContainer.length

        let element = ` <div class="form-row">
                                <div class="col">
                                    <div class="form-group">
                                        <label for="contact_${length + 1}">Contact</label>
                                        <input type="number" maxlength="13" class="form-control" id="contact_${length + 1}"
                                            name="contact_${length + 1}" placeholder="+91 98765 43210" required>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="form-group">
                                        <label for="contactType_${length + 1}">Contact type</label>
                                        <select class="form-control" id="contactType_${length + 1}" name="contactType_${length + 1}">
                                            <option>Home</option>
                                            <option>Office</option>
                                            <option>Personal</option>
                                        </select>
                                    </div>
                                </div>
                        </div>`

        $('#contactContainer').append(element)
    })
})