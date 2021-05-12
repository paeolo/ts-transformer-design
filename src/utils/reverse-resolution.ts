import path from 'path';
import ts from 'typescript';
import {
  Container,
  PackageMeta
} from "../types";

export const reverseResolution = (fileName: string, container: Container): PackageMeta | undefined => {
  const map = container.reverseResolution;

  const resolution = map.get(fileName);

  if (!resolution) {
    return;
  }

  if (typeof resolution !== 'string') {
    return resolution;
  }

  let packageMetaOrString: string | PackageMeta = resolution;
  let visitedString = new Set<string>();

  while (typeof packageMetaOrString === 'string') {
    if (visitedString.has(packageMetaOrString)) {
      return;
    }

    visitedString.add(packageMetaOrString)
    packageMetaOrString = map.get(packageMetaOrString)!;
  }

  const newResolution: PackageMeta = {
    pkg: packageMetaOrString.pkg,
    fileName,
    subModuleName: path.join(
      packageMetaOrString.subModuleName,
      path.relative(packageMetaOrString.fileName, fileName)
    )
  };

  map.set(fileName, newResolution);
  return newResolution;
}


export const createReverseResolutionMap = (sourceFiles: ts.SourceFile[]) => {
  const map = new Map<string, PackageMeta | string>();

  for (const sourceFile of sourceFiles) {
    if ((<any>sourceFile).resolvedModules) {
      const resolvedModules = <Map<string, any>>(<any>sourceFile).resolvedModules;

      for (const [, value] of resolvedModules.entries()) {
        if (value && value.resolvedFileName) {
          if (value.isExternalLibraryImport && value.packageId) {
            map.set(
              value.resolvedFileName,
              {
                fileName: value.resolvedFileName,
                pkg: value.packageId.name,
                subModuleName: value.packageId.subModuleName
              }
            );
          }
          else if (!map.has(value.resolvedFileName)) {
            map.set(value.resolvedFileName, sourceFile.fileName);
          }
        }
      }
    }
  }

  return map;
}
