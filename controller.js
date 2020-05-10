class Controller {
    constructor(modal, view) {
        this.modal = modal
        this.view = view

        this.handleFormSubmit = this.handleFormSubmit.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleView = this.handleView.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.handleSort = this.handleSort.bind(this)
        this.handleListUpdate = this.handleListUpdate.bind(this)

        view.on('formSubmit', this.handleFormSubmit)
        view.on('editContact', this.handleEdit)
        view.on('viewContact', this.handleView)
        view.on('deleteContact', this.handleDelete)
        view.on('searchContact', this.handleSearch)
        view.on('sortContact', this.handleSort)

        modal.on('listUpdated', this.handleListUpdate)

        modal.emit('listUpdated', modal.contacts)
        console.log(this)
    }

    handleFormSubmit(data) {
        this.modal.addContact(data)
    }

    handleEdit(id) {
        let data = this.modal.getContact(id)
        this.view.fillDataInEditModal(data)
    }

    handleView(id) {
        let data = this.modal.getContact(id)
        this.view.fillDataInViewModal(data)
    }

    handleDelete(id) {
        this.modal.deleteContact(id)
    }

    handleSearch(value) {
        this.modal.searchContact(value)
    }

    handleSort(type) {
        this.modal.sortContact(type)
    }

    handleListUpdate(data) {
        this.view.renderList(data)
    }
}

let App = new Controller(new Modal(), new View())