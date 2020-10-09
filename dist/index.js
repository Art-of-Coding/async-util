'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitFor = exports.resolveOrReject = exports.waitOrError = exports.waitOrTimeout = exports.waitUntil = exports.wait = exports.immediate = void 0;
function isEmitter(emitter) {
    return emitter.once && typeof emitter.once === 'function'
        && emitter.removeListener && typeof emitter.removeListener === 'function';
}
async function immediate() {
    return new Promise(resolve => setImmediate(resolve));
}
exports.immediate = immediate;
async function wait(ms) {
    if (typeof ms !== 'number') {
        throw new TypeError('expected argument to be a number');
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
async function waitUntil(event, emitter) {
    if (typeof event !== 'string') {
        throw new TypeError('expected first argument to be a string');
    }
    if (!isEmitter(emitter)) {
        throw new TypeError('expected second argument to be an event emitter');
    }
    return new Promise(resolve => emitter.once(event, (...args) => resolve(args)));
}
exports.waitUntil = waitUntil;
async function waitOrTimeout(event, ms, emitter) {
    if (typeof event !== 'string') {
        throw new TypeError('expected first argument to be a string');
    }
    if (typeof ms !== 'number') {
        throw new TypeError('expected second argument to be a number');
    }
    if (!isEmitter(emitter)) {
        throw new TypeError('expected third argument to be an event emitter');
    }
    return new Promise((resolve, reject) => {
        let timeout;
        const onEvent = (...args) => {
            clearTimeout(timeout);
            resolve(args);
        };
        const onTimeout = () => {
            emitter.removeListener(event, onEvent);
            reject(new Error('timed out'));
        };
        emitter.once(event, onEvent);
        timeout = setTimeout(onTimeout, ms);
    });
}
exports.waitOrTimeout = waitOrTimeout;
async function waitOrError(event, emitter, errorEvent = 'error') {
    if (typeof event !== 'string') {
        throw new TypeError('expected first argument to be a string');
    }
    if (!isEmitter(emitter)) {
        throw new TypeError('expected second argument to be an event emitter');
    }
    if (typeof errorEvent !== 'string') {
        throw new TypeError('expected third argument to be a string');
    }
    return new Promise((resolve, reject) => {
        const onEvent = (...args) => {
            emitter.removeListener(errorEvent, onError);
            resolve(args);
        };
        const onError = (err) => {
            emitter.removeListener(event, onEvent);
            reject(err);
        };
        emitter.once(event, onEvent);
        emitter.once(errorEvent, onError);
    });
}
exports.waitOrError = waitOrError;
async function resolveOrReject(resolveEvents, rejectEvents, emitter) {
    if (!Array.isArray(resolveEvents)) {
        throw new TypeError('expected first argument to be an array');
    }
    if (!Array.isArray(rejectEvents)) {
        throw new TypeError('expected second argument to be an array');
    }
    if (!isEmitter(emitter)) {
        throw new TypeError('expected third argument to be an event emitter');
    }
    return new Promise((resolve, reject) => {
        const removeListeners = () => {
            for (const event of resolveEvents) {
                emitter.removeListener(event, onResolveEvent);
            }
            for (const event of rejectEvents) {
                emitter.removeListener(event, onRejectEvent);
            }
        };
        const onResolveEvent = (...args) => {
            removeListeners();
            resolve(args);
        };
        const onRejectEvent = (err) => {
            removeListeners();
            reject(err);
        };
        for (const event of resolveEvents) {
            emitter.once(event, onResolveEvent);
        }
        for (const event of rejectEvents) {
            emitter.once(event, onRejectEvent);
        }
    });
}
exports.resolveOrReject = resolveOrReject;
function waitFor(resolveEvents, rejectEvents, timeout, emitter) {
    if (!Array.isArray(resolveEvents)) {
        throw new TypeError('expected first argument to be an array');
    }
    if (!Array.isArray(rejectEvents)) {
        throw new TypeError('expected second argument to be an array');
    }
    if (!timeout || isNaN(timeout)) {
        throw new TypeError('expected third agument to be a number');
    }
    if (!isEmitter(emitter)) {
        throw new TypeError('expected fourth argument to be an event emitter');
    }
    let fired = false;
    let rejectTimeout;
    let resolvePromise;
    let rejectPromise;
    const promise = new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
    const onResolve = (...args) => {
        if (!fired) {
            fired = true;
            teardown();
            resolvePromise(...args);
        }
    };
    const onReject = (err) => {
        if (!fired) {
            fired = true;
            teardown();
            rejectPromise(err);
        }
    };
    const teardown = () => {
        for (const event of resolveEvents) {
            emitter.removeListener(event, onResolve);
        }
        for (const event of rejectEvents) {
            emitter.removeListener(event, onReject);
        }
        if (rejectTimeout) {
            clearTimeout(rejectTimeout);
            rejectTimeout = null;
        }
    };
    for (const event of resolveEvents) {
        emitter.once(event, onResolve);
    }
    for (const event of rejectEvents) {
        emitter.once(event, onReject);
    }
    if (typeof timeout === 'number' && timeout > 0) {
        rejectTimeout = setTimeout(() => {
            onReject(new Error('Timed out.'));
        }, timeout);
    }
    return {
        promise,
        cancel: (message) => {
            onReject(new Error(message || 'Canceled.'));
        }
    };
}
exports.waitFor = waitFor;
