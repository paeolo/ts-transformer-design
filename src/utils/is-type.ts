import ts from 'typescript';

import {
  Container
} from '../types';
import {
  getGlobalPromiseConstructorSymbol,
  getGlobalArrayConstructorSymbol
} from './symbols'

export const isFunctionType = (type: ts.Type, typeChecker: ts.TypeChecker) => {
  return !!(type.flags & ts.TypeFlags.Object)
    && typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0;
}

export const isPromiseType = (type: ts.Type, container: Container) => {
  const globalPromiseSymbol = getGlobalPromiseConstructorSymbol(container);

  if (type.symbol && type.symbol === globalPromiseSymbol) {
    return true;
  }

  return false;
}

export const isArrayType = (type: ts.Type, container: Container) => {
  const globalArraySymbol = getGlobalArrayConstructorSymbol(container);

  if (type.symbol && type.symbol === globalArraySymbol) {
    return true;
  }

  return false;
}

export const isTupleType = (type: ts.Type) => {
  return !!((<any>ts).getObjectFlags(type) & ts.ObjectFlags.Reference
    && (<any>type).target.objectFlags & ts.ObjectFlags.Tuple);
}
