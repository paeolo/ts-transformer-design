import {
  Foo,
  TypeReference
} from 'example-2';
import {
  Pikachu,
  NumberOrNull
} from './test';

export enum NumberEnum {
  UN = '1',
  DEUX = '2'
}

const property = (target: any, key: string) => { }

export class Who {
  @property
  she: Foo;
  @property
  foo: TypeReference;
  @property
  me: NumberEnum;
  @property
  pikachu: Pikachu;
  @property
  lol: string | null
  @property
  testtest: NumberOrNull;
}
