export const replaceExt = (fileName: string) => {
  if (fileName.endsWith('.d.ts')) {
    return fileName.slice(0, fileName.length - 5).concat('.js');
  }
  else if (fileName.endsWith('.ts')) {
    return fileName.slice(0, fileName.length - 3).concat('.js');
  }
  else {
    return fileName;
  }
}
