'use strict'

const Logger = require('./logger');
const events = require('events');

var emitter = new events.EventEmitter();

var Types = {
    Create: "create",
    Update: "updated",
    View: "view"
}


emitter.addListener(Types.Create, Logger.onCreate);
emitter.addListener(Types.Update, Logger.onUpdate);
emitter.addListener(Types.View, Logger.onView);


module.exports = {
    getEmitter: function() {
        return emitter;
    },
    Logger,
    Types: Types
};