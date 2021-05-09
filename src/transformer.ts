import ts from 'typescript';

import {
  Container
} from './types'
import {
  visitor
} from './visitor'

export const transformer = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker();
  const compilerOptions = program.getCompilerOptions();
  const languageVersion = (<any>ts).getEmitScriptTarget(compilerOptions);

  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    const container: Container = {
      compilerOptions,
      typeChecker,
      context,
      languageVersion,
      sourceFile
    }

    if (compilerOptions.emitDecoratorMetadata
      && compilerOptions.moduleResolution === ts.ModuleResolutionKind.NodeJs
      && !(<any>ts).isInJSFile(sourceFile)) {
      return ts.visitNode(sourceFile, node => visitor(node, container));
    }
    else {
      return sourceFile;
    }
  }
}
