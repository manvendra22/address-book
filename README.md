# Contacts Book

> Contacts is a responsive web app to store and manage contacts. It's developed following MVC and Publish-Subscribe design pattern in Javascript. It also uses IndexedDB(PouchDB) to persist state in browser's local storage.

### Live link

https://contacts-book.netlify.app/

![Screenshot](https://res.cloudinary.com/dracarys/image/upload/contacts_book.png)

### Tech stack:

- Javascript-MVC
- JQuery
- Bootstrap
- CSS
- IndexedDB

### Features:

- Add/Update/Delete contacts
- Search contacts
- Email and Call contact (Depending on the native device)
- Persist state, uses IndexedDB client side storage

### Roadmap:

- [x] Implement search functionality
- [ ] Add validations, add more fields
- [ ] Make mobile design more native
- [x] Use PouchDb to persist the state in local storage
- [ ] Sync PouchDB to cloud database (CouchDB)
- [ ] Make the app work offline (PWA)
- [ ] Add cookie/unique identfier
- [ ] Use PouchDB find queries for search
