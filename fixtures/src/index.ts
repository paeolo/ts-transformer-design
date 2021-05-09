import { Carambar } from './enum'

const property = (target: any, key: string) => { }

class Foo {
  @property
  bar: Carambar | null;
}

class Bar {
  @property
  plop: number;
}
