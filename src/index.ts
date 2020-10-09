'use strict'

import { EventEmitter } from 'events'

function isEmitter (
  emitter: EventEmitter
) {
  return emitter.once && typeof emitter.once === 'function'
    && emitter.removeListener && typeof emitter.removeListener === 'function'
}

export async function immediate () {
  return new Promise(resolve => setImmediate(resolve))
}

export async function wait (
  ms: number
) {
  if (typeof ms !== 'number') {
    throw new TypeError('expected argument to be a number')
  }

  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitUntil (
  event: string,
  emitter: EventEmitter
) {
  if (typeof event !== 'string') {
    throw new TypeError('expected first argument to be a string')
  }

  if (!isEmitter(emitter)) {
    throw new TypeError('expected second argument to be an event emitter')
  }

  return new Promise(resolve => emitter.once(event, (...args) => resolve(args)))
}

export async function waitOrTimeout (
  event: string,
  ms: number,
  emitter: EventEmitter
) {
  if (typeof event !== 'string') {
    throw new TypeError('expected first argument to be a string')
  }

  if (typeof ms !== 'number') {
    throw new TypeError('expected second argument to be a number')
  }

  if (!isEmitter(emitter)) {
    throw new TypeError('expected third argument to be an event emitter')
  }

  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout

    const onEvent = (...args: any[]) => {
      clearTimeout(timeout)
      resolve(args)
    }

    const onTimeout = () => {
      emitter.removeListener(event, onEvent)
      reject(new Error('timed out'))
    }

    emitter.once(event, onEvent)
    timeout = setTimeout(onTimeout, ms)
  })
}

export async function waitOrError (
  event: string,
  emitter: EventEmitter,
  errorEvent = 'error'
) {
  if (typeof event !== 'string') {
    throw new TypeError('expected first argument to be a string')
  }

  if (!isEmitter(emitter)) {
    throw new TypeError('expected second argument to be an event emitter')
  }

  if (typeof errorEvent !== 'string') {
    throw new TypeError('expected third argument to be a string')
  }

  return new Promise((resolve, reject) => {
    const onEvent = (...args: any[]) => {
      emitter.removeListener(errorEvent, onError)
      resolve(args)
    }

    const onError = (err: Error) => {
      emitter.removeListener(event, onEvent)
      reject(err)
    }

    emitter.once(event, onEvent)
    emitter.once(errorEvent, onError)
  })
}

export async function resolveOrReject (
  resolveEvents: string[],
  rejectEvents: string[],
  emitter: EventEmitter
) {
  if (!Array.isArray(resolveEvents)) {
    throw new TypeError('expected first argument to be an array')
  }

  if (!Array.isArray(rejectEvents)) {
    throw new TypeError('expected second argument to be an array')
  }

  if (!isEmitter(emitter)) {
    throw new TypeError('expected third argument to be an event emitter')
  }

  return new Promise((resolve, reject) => {
    const removeListeners = () => {
      for (const event of resolveEvents) {
        emitter.removeListener(event, onResolveEvent)
      }

      for (const event of rejectEvents) {
        emitter.removeListener(event, onRejectEvent)
      }
    }

    const onResolveEvent = (...args: any[]) => {
      removeListeners()
      resolve(args)
    }

    const onRejectEvent = (err: Error) => {
      removeListeners()
      reject(err)
    }

    for (const event of resolveEvents) {
      emitter.once(event, onResolveEvent)
    }

    for (const event of rejectEvents) {
      emitter.once(event, onRejectEvent)
    }
  })
}

export function waitFor (
  resolveEvents: string[],
  rejectEvents: string[],
  timeout: number,
  emitter: EventEmitter
) {
  if (!Array.isArray(resolveEvents)) {
    throw new TypeError('expected first argument to be an array')
  }

  if (!Array.isArray(rejectEvents)) {
    throw new TypeError('expected second argument to be an array')
  }

  if (!timeout || isNaN(timeout)) {
    throw new TypeError('expected third agument to be a number')
  }

  if (!isEmitter(emitter)) {
    throw new TypeError('expected fourth argument to be an event emitter')
  }

  let fired = false
  let rejectTimeout: NodeJS.Timeout

  let resolvePromise: any
  let rejectPromise: any

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const onResolve = (...args: any[]) => {
    if (!fired) {
      fired = true
      teardown()
      resolvePromise(...args)
    }
  }

  const onReject = (err: Error) => {
    if (!fired) {
      fired = true
      teardown()
      rejectPromise(err)
    }
  }

  const teardown = () => {
    for (const event of resolveEvents) {
      emitter.removeListener(event, onResolve)
    }

    for (const event of rejectEvents) {
      emitter.removeListener(event, onReject)
    }

    if (rejectTimeout) {
      clearTimeout(rejectTimeout)
      rejectTimeout = null
    }
  }

  for (const event of resolveEvents) {
    emitter.once(event, onResolve)
  }

  for (const event of rejectEvents) {
    emitter.once(event, onReject)
  }

  if (typeof timeout === 'number' && timeout > 0) {
    rejectTimeout = setTimeout(() => {
      onReject(new Error('Timed out.'))
    }, timeout)
  }

  return {
    promise,
    cancel: (message?: string) => {
      onReject(new Error(message || 'Canceled.'))
    }
  }
}
