type TLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

interface bindings {
  level: TLevel
  serializers: {}
}

export interface ILogger {
  trace(mergingObject: {}, message: string, ...interpolationValues: any[]): void
  debug(mergingObject: {}, message: string, ...interpolationValues: any[]): void
  info(mergingObject: {}, message: string, ...interpolationValues: any[]): void
  warn(mergingObject: {}, message: string, ...interpolationValues: any[]): void
  error(mergingObject: {}, message: string, ...interpolationValues: any[]): void
  fatal(mergingObject: {}, message: string, ...interpolationValues: any[]): void
  silent(): void
  child(bindings: bindings): ILogger
  bindings(): bindings
  flush(): void
  level: TLevel
  isLevelEnabled(level: TLevel): boolean
  levels: {
    labels: any,
    values: any
  }
  version: string
}

export function createLogger(options?: { level: TLevel, pretty: boolean }, stream?: any): ILogger
