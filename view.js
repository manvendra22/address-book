class View extends EventEmitter {
    constructor() {
        super()

        this.handleFormSubmit = this.handleFormSubmit.bind(this)
        this.addAnotherEmail = this.addAnotherEmail.bind(this)
        this.addAnotherContact = this.addAnotherContact.bind(this)
        this.resetForm = this.resetForm.bind(this)
        this.renderList = this.renderList.bind(this)
        this.handleView = this.handleView.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.fillDataInEditModal = this.fillDataInEditModal.bind(this)
        this.fillDataInViewModal = this.fillDataInViewModal.bind(this)

        this.addInteractionHandlers()
    }

    addInteractionHandlers() {
        $('#addContactBtn').click(this.handleAddContactBtn)
        $('#contactForm').submit(this.handleFormSubmit)
        $('#addAnotherEmail').click(this.addAnotherEmail)
        $('#addAnotherContact').click(this.addAnotherContact)
        $('#contactFormModal').on('hide.bs.modal', this.resetForm)
        $('#listContainer').on('click', '.eye', this.handleView)
        $('#listContainer').on('click', '.edit', this.handleEdit)
        $('#listContainer').on('click', '.cross', this.handleDelete)
        $('input[name="search-input"]').on('input', this.searchData)
    }

    handleAddContactBtn() {
        $('#contactFormModal').modal('show');
    }

    handleFormSubmit(e) {
        e.preventDefault()

        let id = $('#contactForm').attr("data-id")
        let formData = $('#contactForm').serializeArray();
        let jsonData = {}, contacts = [], emails = [];

        $('#contactFormModal').modal('hide');

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

        this.emit('formSubmit', jsonData)
    }

    renderList(contacts) {
        let elements = ''

        contacts.forEach(contact => {
            const { _id, firstName, lastName, contacts, emails } = contact

            let element = this.getListElement(firstName, lastName, contacts, emails, _id)

            elements += element
        })

        $('#listContainer').html(elements)
    }

    handleDelete(e) {
        let id = $(e.target).attr("data-id")
        this.emit('deleteContact', id)
    }

    handleView(e) {
        let id = $(e.target).attr("data-id")
        this.emit('viewContact', id)
    }

    handleEdit(e) {
        let id = $(e.target).attr("data-id")
        this.emit('editContact', id)
    }

    searchData(e) {

    }

    sortData(e) {
        // onclick = "sortData('firstName')
        // type = firstName / lastName / dob
    }

    fillDataInViewModal(data) {
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

    fillDataInEditModal(data) {
        const { firstName, lastName, contacts, dob, emails, _id, _rev } = data

        $('#contactFormModal').modal('show');
        $('#contactContainer').html(null)
        $('#emailContainer').html(null)
        $("#addDataBtn").text('Update')

        $("#contactForm").attr("data-id", _id);
        $("#contactForm").attr("data-rev", _rev);

        $("#firstName").val(firstName);
        $("#lastName").val(lastName);
        $("#dob").val(dob);

        let contactElement = null, contactTypeElement = null;

        contacts.forEach(contact => {
            if (contact.name.includes('contactType')) {
                contactTypeElement = this.getContactTypeElement(contact.name, contact.value)
            } else {
                contactElement = this.getContactElement(contact.name, contact.value)
            }

            if (contactTypeElement && contactElement) {
                let fullContactElement = this.getFullContactElement(contactElement, contactTypeElement)
                $('#contactContainer').append(fullContactElement)
                contactTypeElement = null, contactElement = null
            }
        })

        emails.forEach(email => {
            let emailElement = this.getEmailElement(email.name, email.value)
            $('#emailContainer').append(emailElement)
        })
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
