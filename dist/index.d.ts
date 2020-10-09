/// <reference types="node" />
import { EventEmitter } from 'events';
export declare function immediate(): Promise<unknown>;
export declare function wait(ms: number): Promise<unknown>;
export declare function waitUntil(event: string, emitter: EventEmitter): Promise<unknown>;
export declare function waitOrTimeout(event: string, ms: number, emitter: EventEmitter): Promise<unknown>;
export declare function waitOrError(event: string, emitter: EventEmitter, errorEvent?: string): Promise<unknown>;
export declare function resolveOrReject(resolveEvents: string[], rejectEvents: string[], emitter: EventEmitter): Promise<unknown>;
export declare function waitFor(resolveEvents: string[], rejectEvents: string[], timeout: number, emitter: EventEmitter): {
    promise: Promise<unknown>;
    cancel: (message?: string) => void;
};
