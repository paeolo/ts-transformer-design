import ts from 'typescript';

import {
  Container,
  PackageMeta
} from './types';
import {
  visitor
} from './visitor';

export const transformer = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker();
  const compilerOptions = program.getCompilerOptions();
  const languageVersion = (<any>ts).getEmitScriptTarget(compilerOptions);
  const map = new Map<string, PackageMeta | string>();

  for (const sourceFile of program.getSourceFiles()) {
    if ((<any>sourceFile).resolvedModules) {
      const resolvedModules = <Map<string, any>>(<any>sourceFile).resolvedModules;

      for (const [, value] of resolvedModules.entries()) {
        if (value && value.resolvedFileName) {
          if (value.isExternalLibraryImport) {
            map.set(value.resolvedFileName, {
              fileName: value.resolvedFileName,
              pkg: value.packageId.name,
              subModuleName: value.packageId.subModuleName
            });
          }
          else if (!map.has(value.resolvedFileName)) {
            map.set(value.resolvedFileName, sourceFile.fileName);
          }
        }
      }
    }
  }

  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    const container: Container = {
      compilerOptions,
      typeChecker,
      context,
      languageVersion,
      sourceFile,
      reverseResolution: map,
      isSourceFileFromProject: (sourceFile) => !program.isSourceFileFromExternalLibrary(sourceFile)
        && !program.isSourceFileDefaultLibrary(sourceFile)
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
