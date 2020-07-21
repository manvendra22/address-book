
class Modal extends EventEmitter {
    constructor() {
        super();

        this.fetchContacts = this.fetchContacts.bind(this)

        this.db = new PouchDB('contacts');
        this.initialzeDB()
    }

    initialzeDB() {
        if (this.db) {
            this.fetchContacts()
        }

        this.db.changes({
            since: 'now',
            live: true
        }).on('change', this.fetchContacts);
    }

    resetDB() {
        this.db.destroy()
    }

    fetchContacts() {
        this.db.allDocs({
            include_docs: true,
            descending: true
        }).then(result => {
            console.log('Fetched ', result)
            this._contacts = result.rows
            this.emit('listUpdated', result.rows)
        }).catch(function (err) {
            console.log(err);
        });
    }

    addContact(newContact) {
        this.db.put(newContact).then(function (response) {
            console.log('Added ', response);
        }).catch(function (err) {
            console.log(err);
        });
    }

    getContact(id) {
        let contact = this.db.get(id).then(function (doc) {
            console.log('Fetched ', doc)
            return doc
        }).catch(function (err) {
            console.log(err);
        });

        return contact;
    }

    deleteContact(id) {
        this.db.get(id).then(doc => {
            console.log("In Delete ", this)
            return this.db.remove(doc);
        }).then(function (result) {
            console.log('Deleted ', result)
        }).catch(function (err) {
            console.log(err);
        });
    }

    searchContact(value) {
        if (value.length) {
            let newData = this._contacts.filter(function (contact) {
                let fullName = `${contact?.doc.firstName} ${contact?.doc.lastName}`

                return fullName.toLowerCase().includes(value.toLowerCase())
            })
            this.emit('listUpdated', newData)
        } else {
            this.emit('listUpdated', this._contacts)
        }
    }

    sortContact(type) {
        let newData = this._contacts.sort(function (a, b) {

            let x = a?.doc[type], y = b?.doc[type]

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

// this.addContact({
//     firstName: "John",
//     lastName: "Doe",
//     emails: [{ name: 'email_1', value: 'john@doe.com' }],
//     contacts: [{ name: "contact_1", value: "12345" }, { name: "contactType_1", value: "Home" }],
//     dob: "01/01/1990",
//     city: "Paris",
//     country: "France"
//     company: "Google"
//     _id: "1",
// })