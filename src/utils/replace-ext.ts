import _replaceExt from 'replace-ext';

/**
 * Replace the file extension with the javascript extension
 */
export const replaceExt = (fileName: string) => {
  if (fileName.endsWith('.d.ts')) {
    return fileName.slice(0, fileName.length - 5).concat('.js');
  }
  else {
    return _replaceExt(fileName, '.js');
  }
}
