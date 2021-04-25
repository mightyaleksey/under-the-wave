export interface IAsset {
  abspath: string
  type: string
}

export class Asset implements IAsset {
  abspath: string
  type: string

  static from(abspath: string, type: string): Asset
  constructor(abspath: string, type: string)
}

export class ListItem<V> {
  next: ListItem<any> | null
  value: V

  static from<A>(value: A): ListItem<A>
  constructor(value: V)
}
