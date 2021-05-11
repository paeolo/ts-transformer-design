import ts from 'typescript';

export const getSymbolSourceFile = (symbol: ts.Symbol) => {
  if (symbol.flags & ts.SymbolFlags.ValueModule) {
    return <ts.SourceFile>symbol.declarations[0];
  }

  let currentSymbol = symbol;

  while ((<any>currentSymbol).parent) {
    currentSymbol = (<any>currentSymbol).parent;
    if (currentSymbol.flags & ts.SymbolFlags.ValueModule) {
      return <ts.SourceFile>currentSymbol.declarations[0];
    }
  }
}
