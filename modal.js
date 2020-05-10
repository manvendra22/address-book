
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

    searchContact(value) {
        let newData = this.contacts.filter(function (contact) {
            let fullName = `${contact.firstName} ${contact.lastName}`

            return fullName.toLowerCase().includes(value.toLowerCase())
        })
        this.emit('listUpdated', newData)
    }

    sortContact(type) {
        let newData = this.contacts.sort(function (a, b) {

            let x = a[type], y = b[type]

            if (type == 'dob') {
                x = new Date(x)
                y = new Date(y)
            }

            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        })

        this.emit('listUpdated', newData)
    }
}

// let db = new PouchDB('contacts');

// if (db) {
//     fetchContacts()
// }

// db.changes({
//     since: 'now',
//     live: true
// }).on('change', fetchContacts);

// let contactData = []

// function fetchContacts() {
//     db.allDocs({
//         include_docs: true,
//         descending: true
//     }).then(function (result) {
//         console.log('Fetched ', result)
//         contactData = result.rows
//         showContacts()
//     }).catch(function (err) {
//         console.log(err);
//     });
// }