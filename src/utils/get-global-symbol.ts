import ts from 'typescript';

/**
 * BigInt getter with fallback
 */
export const getGlobalBigIntNameWithFallback = (languageVersion: ts.ScriptTarget, factory: ts.NodeFactory) => {
  return languageVersion < ts.ScriptTarget.ESNext
    ? factory.createConditionalExpression(
      (<any>factory).createTypeCheck(factory.createIdentifier('BigInt'), 'function'),
      undefined,
      factory.createIdentifier('BigInt'),
      undefined,
      factory.createIdentifier('Object')
    )
    : factory.createIdentifier('BigInt');
}

/**
 * Symbol getter with fallback
 */
export const getGlobalSymbolNameWithFallback = (factory: ts.NodeFactory) => {
  return factory.createConditionalExpression(
    (<any>factory).createTypeCheck(factory.createIdentifier('Symbol'), 'function'),
    undefined,
    factory.createIdentifier('Symbol'),
    undefined,
    factory.createIdentifier('Object')
  );
}
