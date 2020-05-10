class Event {
    constructor() {
        this._events = {}
    }

    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener)
    }

    emit(evt, arg) {
        (this._events[evt] || []).slice().forEach(lstnr => lstnr(arg))
    }
}

class Modal {
    constructor() {
        this._contacts = [
            {
                id: "1",
                first_name: "John",
                last_name: "Doe",
                emails: ["john@doe.com"],
                contacts: [{ number: "1234567890", type: "Home", country: "+91" }],
                dob: "01/01/1990"
            }
        ];
    }

    addContact(contact) {
        this._contacts.push(contact);
    }

    deleteContact(id) {
        this._contacts = this._contacts.filter(contact => contact.id !== id);
    }

    editContact(id, newContact) {
        this._contacts = this._contacts.map(contact => {
            if (contact.id === id) {
                return newContact;
            }
            return contact;
        });
    }
}

class View {
    constructor() {
        this.addAnotherEmail = this.addAnotherEmail.bind(this)
        this.addAnotherContact = this.addAnotherContact.bind(this)
        this.resetForm = this.resetForm.bind(this)

        $('#addContactBtn').click(this.handleAddContactBtn)
        $('#contactForm').submit(this.handleFormSubmit)
        $('#addAnotherEmail').click(this.addAnotherEmail)
        $('#addAnotherContact').click(this.addAnotherContact)
        $('#contactFormModal').on('hide.bs.modal', this.resetForm)
    }

    handleAddContactBtn() {
        $('#contactFormModal').modal('show');
    }

    handleFormSubmit(e) {
        e.preventDefault()
        $('#contactFormModal').modal('hide');

        let id = $('#contactForm').attr("data-id")
        let formData = $('#contactForm').serializeArray();
        let jsonData = {}, contacts = [], emails = [];

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
            let rev = $(form).attr("data-rev")
            jsonData._id = id
            jsonData._rev = rev
        } else {
            jsonData._id = new Date().toISOString()
        }

        console.log(jsonData)
    }

    addAnotherEmail() {
        let emailContainer = $('#emailContainer').children()
        let length = emailContainer.length

        let emailElement = this.getEmailElement(`email_${length + 1}`, '')

        $('#emailContainer').append(emailElement)
    }

    addAnotherContact() {
        let contactContainer = $('#contactContainer').children()
        let length = contactContainer.length

        let contactElement = this.getContactElement(`contact_${length + 1}`, '')
        let contactTypeElement = this.getContactTypeElement(`contactType_${length + 1}`, '')
        let fullContactElement = this.getFullContactElement(contactElement, contactTypeElement)

        $('#contactContainer').append(fullContactElement)
    }

    resetForm() {
        $("form").trigger("reset");
        $("form").removeAttr("data-id");
        $("#addDataBtn").text('Add')

        let emailElement = this.getEmailElement('email_1', '')
        let contactElement = this.getContactElement('contact_1', '')
        let contactTypeElement = this.getContactTypeElement('contactType_1', '')
        let fullContactElement = this.getFullContactElement(contactElement, contactTypeElement)

        $('#emailContainer').html(emailElement)
        $('#contactContainer').html(fullContactElement)
    }

    getListElement(firstName, lastName, contacts, emails, id) {
        let emailsLength = emails.length - 1
        let contactsLength = contacts.length / 2 - 1

        return `<div class="list-item">
            <img src="/icons/cross.svg" class="icon cross" alt="delete" data-id=${id}>
            <div class="data-container">
                <div class="main-text">${firstName} ${lastName}</div>
                <div class="sub-text">${contacts[0].value}  ${contactsLength ? `(${contactsLength} more)` : ''}</div>
                ${emails[0].value ? `<div class="sub-text">${emails[0].value} ${emailsLength ? `(${emailsLength} more)` : ''}  </div>` : ''} 
            </div>
            <div class="icons-container">
                <img src="/icons/eye.svg" class="icon eye" alt="view" data-id=${id}>
                <img src="/icons/edit.svg" class="icon edit" alt="edit" data-id=${id}>
                    ${emails[0].value ? `<a href="mailto:${emails[0].value}"><img src="/icons/email.svg" class="icon" alt="mail"></a>` : ''}
                <a href="tel:${contacts[0].value}"><img src="/icons/call.svg" class="icon" alt="call"></a>
            </div>
        </div>`
    }

    getEmailElement(name, value) {
        return ` <div class="form-group">
                <label for=${name}>Email</label>
                <input type="email" class="form-control email" id=${name} name=${name}
                    placeholder="john@doe.com" value=${value}>
            </div>`
    }

    getContactElement(name, value) {
        return ` <div class="form-group">
                <label for=${name}>Contact</label>
                <input type="number" class="form-control contact" id=${name}
                    name=${name} placeholder="+91 98765 43210" value=${value}>
            </div>`
    }

    getContactTypeElement(name, value) {
        return `<div class="form-group">
                <label for=${name}>Contact type</label>
                <select class="form-control" id=${name} name=${name}>
                    ${this.getOptions(value)}
                </select>
            </div>`
    }

    getOptions(value) {
        return `<option ${value === 'Home' ? 'selected' : ''}>Home</option>
            <option ${value === 'Office' ? 'selected' : ''}>Office</option>
            <option ${value === 'Personal' ? 'selected' : ''}>Personal</option>`
    }

    getFullContactElement(contactElement, contactTypeElement) {
        return `<div class="form-row">
            <div class="col">
                ${contactElement}
            </div>
            <div class="col">
                ${contactTypeElement}
            </div>
        </div>`
    }
}

class Controller {
    constructor(modal, view) {
        this.modal = modal
        this.view = view
    }
}

let App = new Controller(new Modal(), new View())