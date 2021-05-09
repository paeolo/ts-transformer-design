import ts from 'typescript';

import {
  Container
} from '../types';

const getGlobalSymbol = (name: string, meaning: ts.SymbolFlags, typeChecker: ts.TypeChecker): ts.Symbol => {
  return (<any>typeChecker).resolveName(
    name,
    undefined,
    meaning,
    false
  )
}

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

export const getGlobalSymbolNameWithFallback = (factory: ts.NodeFactory) => {
  return factory.createConditionalExpression(
    (<any>factory).createTypeCheck(factory.createIdentifier('Symbol'), 'function'),
    undefined,
    factory.createIdentifier('Symbol'),
    undefined,
    factory.createIdentifier('Object')
  );
}

export const getGlobalPromiseConstructorSymbol = (container: Container) => {
  if (!container.globalPromiseConstructorSymbol) {
    container.globalPromiseConstructorSymbol = getGlobalSymbol(
      'Promise',
      ts.SymbolFlags.Value,
      container.typeChecker
    );
  }

  return container.globalPromiseConstructorSymbol;
}

export const getGlobalArrayConstructorSymbol = (container: Container) => {
  if (!container.globalArraySymbol) {
    container.globalArraySymbol = getGlobalSymbol(
      'Array',
      ts.SymbolFlags.Value,
      container.typeChecker
    );
  }

  return container.globalArraySymbol;
}
