'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const index_1 = require("./index");
const emitter = new events_1.EventEmitter();
async function run() {
    console.log('wait 1s');
    await index_1.wait(1000);
    console.log('wait 1s over');
    console.log();
    console.log('waitUntil \'event\'');
    setTimeout(() => emitter.emit('event'), 1500);
    await index_1.waitUntil('event', emitter);
    console.log('wait is over');
    console.log();
    console.log('waitOrError \'event\' (event)');
    setTimeout(() => emitter.emit('event'), 1500);
    await index_1.waitOrError('event', emitter);
    console.log('wait is over');
    console.log();
    console.log('waitOrError \'event\' (error)');
    setTimeout(() => emitter.emit('error', new Error('some error message')), 1500);
    try {
        await index_1.waitOrError('event', emitter);
    }
    catch (e) {
        console.log('wait is over with error', e.message);
    }
    console.log();
}
run().then(() => {
    console.log('run complete');
});
