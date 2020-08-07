class View extends EventEmitter {
    constructor() {
        super()

        this.handleFormSubmit = this.handleFormSubmit.bind(this)
        this.addAnotherEmail = this.addAnotherEmail.bind(this)
        this.addAnotherContact = this.addAnotherContact.bind(this)
        this.resetFormModal = this.resetFormModal.bind(this)
        this.renderList = this.renderList.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.searchData = this.searchData.bind(this)
        this.fillDataInEditModal = this.fillDataInEditModal.bind(this)

        this.addInteractionHandlers()
    }

    addInteractionHandlers() {
        $('#addContactBtn').click(this.handleAddContactBtn)
        $('#contactForm').submit(this.handleFormSubmit)
        $('#addAnotherEmail').click(this.addAnotherEmail)
        $('#addAnotherContact').click(this.addAnotherContact)
        $('#contactFormModal').on('hide.bs.modal', this.resetFormModal)
        $('#contactViewModal').on('hide.bs.modal', this.resetViewModal)
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
            let rev = $('#contactForm').attr("data-rev")
            jsonData._id = id
            jsonData._rev = rev
        } else {
            jsonData._id = new Date().toISOString()
        }

        this.emit('formSubmit', jsonData)
    }

    renderList(contactsData) {
        let elements = ''

        contactsData.forEach(contact => {
            const { _id, fullName, contacts, emails, company, title } = contact.doc

            let element = this.getListElement(_id, fullName, contacts, emails, company, title)

            elements += element
        })

        if (elements === '') {
            elements = '<div class="info-text">List is empty, add some contacts to start.</div>'
        }

        $('#listContainer').html(elements)
    }

    handleDelete(e) {
        let id = $(e.target).attr("data-id")
        this.emit('deleteContact', id)
    }

    handleEdit(e) {
        let id = $(e.target).attr("data-id")
        this.emit('editContact', id)
    }

    searchData(e) {
        this.emit('searchContact', e.target.value)
    }

    fillDataInEditModal(data) {
        const { _id, _rev, fullName, contacts, emails, company, title } = data

        $('#contactFormModal').modal('show');
        $('#contactContainer').html(null)
        $('#emailContainer').html(null)
        $("#addDataBtn").text('Update')

        $("#contactForm").attr("data-id", _id);
        $("#contactForm").attr("data-rev", _rev);

        $("#fullName").val(fullName);
        $("#company").val(company);
        $("#title").val(title);

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

    resetFormModal() {
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

    resetViewModal() {
        $('#viewContactContainer').html('<div><b>Contact:</b></div>')
        $('#viewContactTypeContainer').html('<div><b>Contact Type:</b></div>')
        $('#viewEmailContainer').html('<div><b>Email:</b></div>')
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

    getListElement(id, fullName, contacts, emails, company, title) {
        let emailsLength = emails.length - 1
        let contactsLength = contacts.length / 2 - 1

        return `<div class="list-item">
                <div class="top text-capitalize">
                    <div>
                        <div class='main-text'>${fullName}</div>
                        <div class='sub-text'>${title}, ${company}</div>
                    </div>
                    <img src="/icons/edit.svg" class="icon edit" alt="edit" data-id=${id}>
                    <img src="/icons/cross.svg" class="icon cross" alt="delete" data-id=${id}>
                </div>
                <div class="bottom dark-text">
                    <div>${contacts[0].value}  ${contactsLength ? `(${contactsLength} more)` : ''}</div>
                    <div>${emails[0].value} ${emailsLength ? `(${emailsLength} more)` : ''}</div>
                    <div class="contact-now">
                        <a class="contact-link" href="mailto:${emails[0].value}">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 479.058 479.058"
                                class="contact-icon"
                                >
                                <path
                                    d="M408.602 83.461H70.456c-21.515 0-39.017 17.502-39.017 39.018v234.1c0 21.516 17.502 39.018 39.017 39.018h338.146c21.515 0 39.017-17.502 39.017-39.017V122.479c0-21.516-17.502-39.018-39.017-39.018zm0 26.012c1.767 0 3.448.366 4.985 1.006L239.529 261.336 65.471 110.48a12.946 12.946 0 014.984-1.006zm0 260.112H70.456c-7.176 0-13.006-5.83-13.006-13.006V137.96l173.557 150.416c2.451 2.12 5.487 3.175 8.522 3.175s6.07-1.053 8.522-3.175L421.608 137.96v218.62c-.001 7.175-5.83 13.005-13.006 13.005z"
                                    data-original="#000000"
                                    class="active-path"
                                    fill="currentColor"
                            />
                            </svg>
                            Send mail
                        </a>
                        <a class="contact-link" href="tel:${contacts[0].value}">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 511.999 511.999"
                                class="contact-icon"
                                >
                                <path
                                    d="M477.826 367.114l-58.144-58.145c-16.03-16.03-42.115-16.03-58.144 0l-26.43 26.43c-12.144 12.143-31.905 12.14-44.045.004L176.508 220.75c-12.172-12.173-12.174-31.874 0-44.049l26.43-26.429c15.96-15.959 16.182-41.962-.016-58.159l-58.13-57.946c-16.03-16.03-42.113-16.03-58.1-.042L65.504 55.128c-57.807 57.806-57.807 151.864-.003 209.669l181.509 181.604c57.942 57.943 151.724 57.948 209.671 0l21.144-21.144c16.03-16.03 16.03-42.113 0-58.143zM106.031 53.548c5.343-5.343 14.036-5.344 19.396.015l58.13 57.946c5.355 5.356 5.355 14.024 0 19.381l-9.692 9.69-77.476-77.475 9.642-9.557zm160.365 373.474L84.886 245.417c-44.724-44.724-47.182-114.95-7.56-162.612l77.25 77.25c-20.298 23.011-19.452 58.075 2.547 80.073l114.551 114.648.004.003c21.974 21.976 57.036 22.877 80.075 2.55l77.252 77.253c-47.509 39.554-117.578 37.472-162.61-7.56zm192.05-21.146l-9.691 9.692-77.526-77.527 9.69-9.69c5.344-5.344 14.038-5.345 19.382 0l58.144 58.144c5.344 5.344 5.344 14.039.001 19.381z"
                                    data-original="#000000"
                                    class="active-path"
                                    fill="currentColor"
                                />
                            </svg>
                            Call
                        </a>
                    </div>
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
            <div class="col-8">
                ${contactElement}
            </div>
            <div class="col">
                ${contactTypeElement}
            </div>
        </div>`
    }
}

// $("#contactForm").validate({
//     rules: {
//         fullName: {
//             required: true,
//             maxlength: 25
//         },
//         lastName: {
//             required: true,
//             maxlength: 25
//         },
//     },
//     submitHandler: function (form) {
//         // form.submit();
//         submitForm(form)
//     }
// });

// Rules while addContact

// $('.contact').each(function () {
//     $(this).rules("add",
//         {
//             required: true,
//             maxlength: 13,
//         });
// });

// $('.email').each(function () {
//     $(this).rules("add",
//         {
//             maxlength: 30,
//         });
// });