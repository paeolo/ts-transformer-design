import ts from 'typescript';

import {
  Container
} from './types';
import {
  getRequirePath
} from './utils';

/**
 * Recursively visit the symbol and its parents
 * and create the corresponding property accessor to access the symbol within the module
 */
export const visitorSymbol = (symbol: ts.Symbol, container: Container): ts.Expression | undefined => {
  const factory = container.context.factory;
  const parent = <ts.Symbol | undefined>((<any>symbol).parent);

  if (parent) {
    const parentExpression = visitorSymbol(parent, container);

    if (parentExpression) {
      return factory.createPropertyAccessExpression(
        parentExpression,
        symbol.name
      );
    } else {
      return factory.createIdentifier(symbol.name);
    }
  }

  if (symbol.flags & ts.SymbolFlags.ValueModule) {
    const requirePath = getRequirePath(<ts.SourceFile>symbol.declarations[0], container);

    if (requirePath === null) {
      return factory.createIdentifier('Object');
    }

    if (requirePath === undefined) {
      return;
    }

    return factory.createCallExpression(
      factory.createIdentifier('require'),
      undefined,
      [factory.createStringLiteral(requirePath)]
    );
  }

  return factory.createIdentifier(symbol.name);
}
