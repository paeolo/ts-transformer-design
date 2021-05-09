import ts from 'typescript';

import {
  Container,
  IntrisicTypes
} from './types';
import {
  getGlobalBigIntNameWithFallback,
  wrapper,
  isArrayType,
  isFunctionType,
  isPromiseType,
  isTupleType,
  getGlobalSymbolNameWithFallback
} from './utils';

export const visitorTypeReference = (node: ts.TypeReferenceNode, container: Container) => {
  const typeChecker = container.typeChecker;
  const factory = container.context.factory;
  const languageVersion = container.languageVersion;

  const type = typeChecker.getTypeFromTypeNode(node);

  if (!type) {
    return wrapper(factory.createIdentifier('Object'));
  }

  if (node.typeName) {
    // TODO: use a symbol resolver with nodejs require
    return wrapper(factory.createIdentifier('Object'));
  }

  if ((<any>type).intrinsicName) {
    switch (<string>(<any>type).intrinsicName) {
      case IntrisicTypes.ANY:
      case IntrisicTypes.ERROR:
      case IntrisicTypes.OBJECT:
      case IntrisicTypes.UNDEFINED:
      case IntrisicTypes.UNKNOWN:
        return wrapper(factory.createIdentifier('Object'));
      case IntrisicTypes.VOID:
      case IntrisicTypes.NEVER:
        return wrapper(factory.createVoidZero());
      case IntrisicTypes.BIGINT:
        return wrapper(getGlobalBigIntNameWithFallback(languageVersion, factory));
      case IntrisicTypes.BOOLEAN:
      case IntrisicTypes.TRUE:
      case IntrisicTypes.FALSE:
        return wrapper(factory.createIdentifier('Boolean'));
      case IntrisicTypes.NUMBER:
        return wrapper(factory.createIdentifier('Number'));
      case IntrisicTypes.STRING:
        return wrapper(factory.createIdentifier('String'));
      case IntrisicTypes.NULL:
        return wrapper(factory.createNull());
      case IntrisicTypes.SYMBOL:
        return wrapper(
          languageVersion < ts.ScriptTarget.ES2015
            ? getGlobalSymbolNameWithFallback(factory)
            : factory.createIdentifier('Symbol')
        );
    }
  }
  else if (isFunctionType(type, typeChecker)) {
    return wrapper(factory.createIdentifier('Function'));
  }
  else if (isPromiseType(type, container)) {
    return wrapper(factory.createIdentifier('Promise'));
  }
  else if (isArrayType(type, container) || isTupleType(type)) {
    return wrapper(factory.createIdentifier('Array'));
  }

  return wrapper(factory.createIdentifier('Object'));
}
