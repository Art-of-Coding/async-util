# WS

Three simple, asynchronous methods that may make life easier.

All methods return a Promise.

## Methods

### `wait (ms: number)`

Waits for `ms` milliseconds before resolving.
This method encapsulates `setTimeout` into a Promise.

```ts
import { wait } from './index'

async function run () {
  console.log('before')
  await wait(1000) // wait 1000ms or 1s
  console.log('after')
}
```

### `waitUntil (event: string, emitter: EventEmitter)`

Waits until `event` is emitted on the given `emitter`.
The promise is resolved with an array containing the event's arguments, or an
empty array if there were none.

```ts
import { EventEmitter } from 'events'
import { waitUntil } from './index'

const emitter = new EventEmitter()

async function run () {
  // some code to emit an event...
  setTimeout(() => emitter.emit('some-event'), 1000)

  console.log('before')
  await waitUntil('some-event', emitter)
  console.log('after')
}
```

### `waitOrTimeout (event: string, emitter: EventEmitter, ms: number)`

Waits until `event` is emitted on the given `emitter`, or when `ms` has elapsed.
If the time has elapsed, the Promise rejects.

```ts
import { EventEmitter } from 'events'
import { waitOrTimeout } from './index'

const emitter = new EventEmitter()

async function run () {
  // some code to emit an event...
  setTimeout(() => emitter.emit('some-event'), 1500)

  console.log('before')
  await waitOrTimeout('some-event', emitter, 1000)
  console.log('after')
}
```

### `waitOrError (event: string, emitter: EventEmitter, errorEvent = 'error')`

Waits until either `event` or `errorEvent` is emitted on the given `emitter`.
If `errorEvent` is emitted, the Promise rejects.

```ts
import { EventEmitter } from 'events'
import { waitErError } from './index'

const emitter = new EventEmitter()

async function run () {
  // some code to emit an event...
  setTimeout(() => emitter.emit('some-event'), 1000)
  // some code to emit an error...
  // setTimeout(() => emitter.emit('error', new Error('some error message')), 1000)

  console.log('before')
  await waitOrError('some-event', emitter)
  console.log('after')
}
```

### `resolveOrReject (resolveEvents: string[], rejectEvents: string[], emitter: EventEmitter)`

Resolves or rejects based on which event is received.

```ts
import { EventEmitter } from 'events'
import { resolveOrReject } from './index'

const emitter = new EventEmitter()

async function run () {
  const resolveEvents = [ 'connected', 'ready' ]
  const rejectEvents = [ 'error', 'close' ]

  // some code to emit an event...
  setTimeout(() => emitter.emit('ready'), 1000)

  console.log('before')
  await resolveOrReject (resolveEvents, rejectEvents, emitter)
  console.log('after')
}
```

### `waitFor (resolveEvents: string[], rejectEvents: string[], timeout: number, emitter: EventEmitter)`

Resolves or rejects based on which event is received, or until the optional
timeout has expired. The promise is also cancelable.

```ts
import { EventEmitter } from 'events'
import { waitFor } from './index'

const emitter = new EventEmitter()

async function run () {
  const resolveEvents = [ 'connected', 'ready' ]
  const rejectEvents = [ 'error', 'close' ]
  const timeout = 10 * 1000 // optional timeout 10s

  // some code to emit an event...
  setTimeout(() => emitter.emit('ready'), 1000)

  const { promise, cancel } = waitFor (resolveEvents, rejectEvents, timeout, emitter)

  console.log('before')
  await promise
  console.log('after')
}
```

## License

Copyright 2017 [Art of Coding](http://artofcoding.nl).

This software is licensed under the [MIT License](LICENSE).
