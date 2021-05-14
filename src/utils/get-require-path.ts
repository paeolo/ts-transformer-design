import ts from 'typescript';
import path from 'path';

import {
  Container
} from '../types';
import {
  replaceExt
} from './replace-ext';
import {
  reverseResolution
} from './reverse-resolution';

/**
 * Get the path to resolve the source file with node
 */
export const getRequirePath = (sourceFile: ts.SourceFile, container: Container) => {
  if (container.sourceFile.fileName === sourceFile.fileName) {
    return undefined;
  }

  if (container.isSourceFileFromProject(sourceFile)) {
    const relativeDir = path.relative(
      path.dirname(container.sourceFile.fileName),
      path.dirname(sourceFile.fileName)
    );

    const fileName = replaceExt(path.basename(sourceFile.fileName));

    return relativeDir.length === 0
      ? './'.concat(fileName)
      : path.join(relativeDir, fileName);
  }

  const packageMeta = reverseResolution(sourceFile.fileName, container);

  if (!packageMeta) {
    return null;
  }

  return packageMeta.pkg
    .concat('/')
    .concat((replaceExt(packageMeta.subModuleName)));
}
