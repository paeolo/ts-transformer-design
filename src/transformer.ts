import ts from 'typescript';

import {
  Container,
} from './types';
import {
  createReverseResolutionMap
} from './utils';
import {
  visitor
} from './visitor';

/**
 * A typescript transformer to add type metadata
 * in the form of a type resolver
 */
export const transformer = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker();
  const compilerOptions = program.getCompilerOptions();
  const languageVersion = (<any>ts).getEmitScriptTarget(compilerOptions);
  const map = createReverseResolutionMap(<ts.SourceFile[]>program.getSourceFiles());

  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    const container: Container = {
      typeChecker,
      compilerOptions,
      context,
      languageVersion,
      sourceFile,
      isSourceFileFromProject: (sourceFile) => !program.isSourceFileFromExternalLibrary(sourceFile)
        && !program.isSourceFileDefaultLibrary(sourceFile),
      reverseResolution: map,
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
