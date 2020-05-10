
class Modal extends EventEmitter {
    constructor() {
        super();

        this.contacts = [];
        this.addContact({
            firstName: "John",
            lastName: "Doe",
            emails: [{ name: 'email_1', value: 'john@doe.com' }],
            contacts: [{ name: "contact_1", value: "12345" }, { name: "contactType_1", value: "Home" }],
            dob: "01/01/1990",
            _id: "1",
        })

        this.deleteContact = this.deleteContact.bind(this)
    }

    addContact(newContact) {
        let index = this.contacts.findIndex(contact => contact._id === newContact._id)

        if (index === -1) {
            this.contacts.push(newContact)
        } else {
            this.contacts = this.contacts.map(contact => {
                if (contact._id === newContact._id) {
                    return newContact;
                }
                return contact;
            });
        }

        this.emit('listUpdated', this.contacts)
    }

    getContact(id) {
        console.log({ id })
        return this.contacts.find(contact => contact._id === id)
    }

    deleteContact(id) {
        this.contacts = this.contacts.filter(contact => contact._id !== id);
        this.emit('listUpdated', this.contacts)
    }
}