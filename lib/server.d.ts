import { Server } from 'http'

import { ILogger } from './logger'

export function createServer(logger: ILogger, port: number): Server
export function createSocket(handler: (message: string, send: (message: string) => void) => void): void
export function broadcast(message: string): void
