import path from 'path';
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

  while (typeof packageMetaOrString === 'string') {
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
