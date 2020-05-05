class Modal {
    constructor() {
        this.contacts = [
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
        this.contacts.add(contact);
    }

    deleteContact(id) {
        this.contacts = this.contacts.filter(contact => contact.id !== id);
    }

    editContact(id, newContact) {
        this.contacts = this.contacts.map(contact => {
            if (contact.id === id) {
                return newContact;
            }
            return contact;
        });
    }
}

class View {
    constructor() {
        this.contactListElement = this.getElement("#contacts");
        this.formElement = this.getElement("form");
        this.submitElement = this.getElement("button");
    }

    createElement(type, className) {
        let element = document.createElement(type);
        element.classList.add(className);

        return element;
    }

    getElement(selector) {
        return document.querySelector(selector);
    }
}