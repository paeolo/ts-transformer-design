import path from 'path';
import ts from 'typescript';

import {
  Container
} from './types';
import {
  wrapper,
  getSymbolSourceFile,
  replaceExt,
  reverseResolution
} from './utils';

export const visitorTypeSymbol = (symbol: ts.Symbol, container: Container) => {
  const sourceFile = getSymbolSourceFile(symbol);
  const factory = container.context.factory;

  let requirePath: string;

  if (!sourceFile) {
    return wrapper(factory.createIdentifier(symbol.name));
  }

  if (container.isSourceFileFromProject(sourceFile)) {
    const relativeDirPath = path.relative(
      path.dirname(container.sourceFile.fileName),
      path.dirname(sourceFile.fileName)
    );
    const parsedPath = path.parse(sourceFile.fileName);
    const fileName = replaceExt(parsedPath.name);

    requirePath = relativeDirPath.length === 0
      ? './'.concat(fileName)
      : path.join(relativeDirPath, fileName);
  } else {
    const packageMeta = reverseResolution(sourceFile.fileName, container);

    if (!packageMeta) {
      return wrapper(factory.createIdentifier('Object'));
    }

    requirePath = packageMeta.pkg
      .concat('/')
      .concat((replaceExt(packageMeta.subModuleName)));
  }

  return wrapper(
    factory.createPropertyAccessExpression(
      factory.createCallExpression(
        factory.createIdentifier('require'),
        undefined,
        [factory.createStringLiteral(requirePath)]
      ),
      factory.createIdentifier(symbol.name)
    )
  );
}
