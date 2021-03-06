class Controller {
    constructor(modal, view) {
        this.modal = modal
        this.view = view

        this.handleFormSubmit = this.handleFormSubmit.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.handleListUpdate = this.handleListUpdate.bind(this)

        view.on('formSubmit', this.handleFormSubmit)
        view.on('editContact', this.handleEdit)
        view.on('deleteContact', this.handleDelete)
        view.on('searchContact', this.handleSearch)

        modal.on('listUpdated', this.handleListUpdate)

        this.modal.addContact({
            _id: "1",
            fullName: "John Doe",
            emails: [{ name: 'email_1', value: 'john@doe.com' }],
            contacts: [{ name: "contact_1", value: "9876543210" }, { name: "contactType_1", value: "Office" }],
            company: "Google",
            title: "Developer",
        })
    }

    handleFormSubmit(data) {
        this.modal.addContact(data)
    }

    handleEdit(id) {
        let contact = this.modal.getContact(id)

        contact.then(data => {
            this.view.fillDataInEditModal(data)
        })
    }

    handleDelete(id) {
        this.modal.deleteContact(id)
    }

    handleSearch(value) {
        this.modal.searchContact(value)
    }

    handleListUpdate(data) {
        this.view.renderList(data)
    }
}

let App = new Controller(new Modal(), new View())