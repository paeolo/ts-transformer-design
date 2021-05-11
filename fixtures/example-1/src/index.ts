import { LOL } from 'example-2'

const property = (target: any, key: string) => { }

class Who {
  @property
  bar: LOL;
}
