import ts from 'typescript';

import {
  Container,
  IntrisicTypes
} from './types';
import {
  getGlobalBigIntNameWithFallback,
  getGlobalSymbolNameWithFallback,
  wrapExpression,
} from './utils';
import {
  visitorSymbol
} from './visitor-symbol';

export const visitorTypeReference = (node: ts.TypeReferenceNode, container: Container) => {
  const typeChecker = container.typeChecker;
  const factory = container.context.factory;

  const type = typeChecker.getTypeFromTypeNode(node);

  if (!type) {
    return wrapExpression(factory.createIdentifier('Object'));
  }

  return visitorType(type, container);
}

export const visitorType = (type: ts.Type, container: Container): ts.ObjectLiteralExpression => {
  const factory = container.context.factory;
  const languageVersion = container.languageVersion;

  /**
   * Regular Enum
   */
  if (type.symbol && (type.symbol.flags & ts.SymbolFlags.RegularEnum)) {
    const items = visitorSymbol(type.symbol, container);

    return wrapExpression(
      factory.createStringLiteral('regularEnum'),
      wrapExpression(items!),
      type.symbol.name
    );
  }

  /**
   * Array
   */
  if (type.symbol
    && !(<any>type.symbol).parent
    && type.symbol.name === 'Array'
    && (<any>type).typeArguments
    && (<any>type).typeArguments[0]) {
    return wrapExpression(
      factory.createIdentifier('Array'),
      visitorType((<any>type).typeArguments[0], container)
    );
  }

  /**
   * Intersection
   */
  if (type.flags & ts.TypeFlags.Intersection) {
    return wrapExpression(
      factory.createStringLiteral('ALL_OF'),
      factory.createArrayLiteralExpression(
        (<any>type).types.map((value: ts.Type) => visitorType(value, container))
      )
    );
  }

  /**
   * Union
   */
  if (type.flags & ts.TypeFlags.Union) {
    return wrapExpression(
      factory.createStringLiteral('ONE_OF'),
      factory.createArrayLiteralExpression(
        (<any>type).types.map((value: ts.Type) => visitorType(value, container))
      )
    );
  }

  /**
   * Value
   */
  if (type.symbol && (type.symbol.flags & ts.SymbolFlags.Value)) {
    return wrapExpression(visitorSymbol(type.symbol, container)!);
  }

  /**
   * Intrisic type
   */
  if ((<any>type).intrinsicName) {
    switch (<string>(<any>type).intrinsicName) {
      case IntrisicTypes.ANY:
      case IntrisicTypes.ERROR:
      case IntrisicTypes.OBJECT:
      case IntrisicTypes.UNDEFINED:
      case IntrisicTypes.UNKNOWN:
        return wrapExpression(factory.createIdentifier('Object'));
      case IntrisicTypes.VOID:
      case IntrisicTypes.NEVER:
        return wrapExpression(factory.createVoidZero());
      case IntrisicTypes.BIGINT:
        return wrapExpression(getGlobalBigIntNameWithFallback(languageVersion, factory));
      case IntrisicTypes.BOOLEAN:
      case IntrisicTypes.TRUE:
      case IntrisicTypes.FALSE:
        return wrapExpression(factory.createIdentifier('Boolean'));
      case IntrisicTypes.NUMBER:
        return wrapExpression(factory.createIdentifier('Number'));
      case IntrisicTypes.STRING:
        return wrapExpression(factory.createIdentifier('String'));
      case IntrisicTypes.NULL:
        return wrapExpression(factory.createNull());
      case IntrisicTypes.SYMBOL:
        return wrapExpression(
          languageVersion < ts.ScriptTarget.ES2015
            ? getGlobalSymbolNameWithFallback(factory)
            : factory.createIdentifier('Symbol')
        );
    }
  }

  /**
   * Failover
   */
  return wrapExpression(factory.createIdentifier('Object'));
}
