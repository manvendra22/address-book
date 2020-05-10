class EventEmitter {
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