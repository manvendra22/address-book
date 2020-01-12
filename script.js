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

        let emailsLength = emails.length - 1
        let contactsLength = contacts.length / 2 - 1

        let element = `<div class="list-item">
                            <img src="/icons/cross.svg" class="icon cross" alt="delete" data-id=${id}>
                            <div class="data-container">
                                <p>${firstName} ${lastName}</p>
                                <p>${contacts[0].value}  ${contactsLength ? `(${contactsLength} more)` : ''}</p>
                                ${emails[0].value ? `<p>${emails[0].value} ${emailsLength ? `(${emailsLength} more)` : ''}  </p>` : ''} 
                            </div>
                            <div class="icons-container">
                                <img src="/icons/eye.svg" class="icon eye" alt="view" data-id=${id}>
                                <img src="/icons/edit.svg" class="icon edit" alt="edit" data-id=${id}>
                                 ${emails[0].value ? `<a href="mailto:${emails[0].value}"><img src="/icons/email.svg" class="icon" alt="mail"></a>` : ''}
                                <a href="tel:${contacts[0].value}"><img src="/icons/call.svg" class="icon" alt="call"></a>
                            </div>
                        </div>`

        elements += element
    })

    $('.list-container').html(elements)
}

function fillDataInViewModal(data) {
    const { firstName, lastName, dob, contacts, emails } = data

    $('#contactViewModal').modal('show');

    $("#viewName").text(`${firstName} ${lastName}`);
    $("#viewDob").text(dob);

    contacts.forEach(contact => {
        if (contact.name.includes('contactType')) {
            let contactTypeElement = `<div>${contact.value}</div>`
            $('#viewContactTypeContainer').append(contactTypeElement)
        } else {
            let contactElement = `<div>${contact.value}</div>`
            $('#viewContactContainer').append(contactElement)
        }
    })

    emails.forEach(email => {
        let elementEmail = `<div>${email.value}</div>`

        $('#viewEmailContainer').append(elementEmail)
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
            contactTypeElement = getContactTypeElement(contact.name, contact.value)

        } else {
            contactElement = getContactElement(contact.name, contact.value)
        }

        if (contactTypeElement && contactElement) {
            let fullContactElement = getFullContactElement(contactElement, contactTypeElement)

            $('#contactContainer').append(fullContactElement)

            contactTypeElement = null, contactElement = null
        }
    })

    emails.forEach(email => {
        let emailElement = getEmailElement(email.name, email.value)

        $('#emailContainer').append(emailElement)
    })
}

function addContact() {
    $("form").trigger("reset");

    $("form").removeAttr("data-id");
    $("#addData").text('Add')

    $('#contactFormModal').modal('show');

    let emailElement = getEmailElement('email_1', '')

    let contactElement = getContactElement('contact_1', '')
    let contactTypeElement = getContactTypeElement('contactType_1', '')
    let fullContactElement = getFullContactElement(contactElement, contactTypeElement)

    $('#emailContainer').html(emailElement)

    $('#contactContainer').html(fullContactElement)
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
        $('#viewContactContainer').html('<div><b>Contact:</b></div>')
        $('#viewContactTypeContainer').html('<div><b>Contact Type:</b></div>')
        $('#viewEmailContainer').html('<div><b>Email:</b></div>')
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

        let emailElement = getEmailElement(`email_${length + 1}`, '')

        $('#emailContainer').append(emailElement)
    })

    $('#addAnotherContact').click(function () {
        let contactContainer = $('#contactContainer').children()
        let length = contactContainer.length

        let contactElement = getContactElement(`contact_${length + 1}`, '')
        let contactTypeElement = getContactTypeElement(`contactType_${length + 1}`, '')
        let fullContactElement = getFullContactElement(contactElement, contactTypeElement)

        $('#contactContainer').append(fullContactElement)
    })
})

function getEmailElement(name, value) {
    return ` <div class="form-group">
                <label for=${name}>Email</label>
                <input type="email" maxlength="30" class="form-control" id=${name} name=${name}
                    placeholder="john@doe.com" value=${value}>
            </div>`
}

function getContactElement(name, value) {
    return ` <div class="form-group">
                <label for=${name}>Contact</label>
                <input type="number" maxlength="13" class="form-control" id=${name}
                    name=${name} placeholder="+91 98765 43210" required value=${value}>
            </div>`
}

function getContactTypeElement(name, value) {
    return `<div class="form-group">
                <label for=${name}>Contact type</label>
                <select class="form-control" id=${name} name=${name}>
                    ${getOptions(value)}
                </select>
            </div>`
}

function getOptions(value) {
    return `<option ${value === 'Home' ? 'selected' : ''}>Home</option>
            <option ${value === 'Office' ? 'selected' : ''}>Office</option>
            <option ${value === 'Personal' ? 'selected' : ''}>Personal</option>`
}

function getFullContactElement(contactElement, contactTypeElement) {
    return `<div class="form-row">
            <div class="col">
                ${contactElement}
            </div>
            <div class="col">
                ${contactTypeElement}
            </div>
        </div>`
}