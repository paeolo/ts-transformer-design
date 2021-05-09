import path from 'path';
import ts from 'typescript';

import {
  Container
} from './types';
import {
  wrapper
} from './utils';

export const visitorTypeSymbol = (symbol: ts.Symbol, container: Container) => {
  const parentSymbol = <ts.Symbol>((<any>symbol).parent);
  const factory = container.context.factory;

  if (parentSymbol && parentSymbol.flags & ts.SymbolFlags.ValueModule) {
    let relativeName: string;
    const symbolFileName = (<any>parentSymbol.declarations[0]).fileName;

    let relativeDirPath = path.relative(
      path.dirname(container.sourceFile.fileName),
      path.dirname(symbolFileName)
    );
    const parsedPath = path.parse(symbolFileName);

    if (relativeDirPath.length === 0) {
      relativeName = './'.concat(parsedPath.name)
    }
    else {
      relativeName = path.join(relativeDirPath, parsedPath.name);
    }

    return wrapper(
      factory.createPropertyAccessExpression(
        factory.createCallExpression(
          factory.createIdentifier('require'),
          undefined,
          [factory.createStringLiteral(relativeName)]
        ),
        factory.createIdentifier(symbol.name)
      )

    );
  }
  return wrapper(factory.createIdentifier('Object'));
}
