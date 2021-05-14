import ts from 'typescript';

export const METADATA_KEY = 'design:resolver';

export interface Container {
  typeChecker: ts.TypeChecker;
  compilerOptions: ts.CompilerOptions;
  context: ts.TransformationContext;
  languageVersion: ts.ScriptTarget;
  sourceFile: ts.SourceFile;
  isSourceFileFromProject: (sourceFile: ts.SourceFile) => boolean;
  reverseResolution: Map<string, PackageMeta | string>;
}

export const enum IntrisicTypes {
  ANY = 'any',
  BIGINT = 'bigint',
  BOOLEAN = 'boolean',
  ERROR = 'error',
  FALSE = 'false',
  INTRISIC = 'intrinsic',
  NEVER = 'never',
  NULL = 'null',
  NUMBER = 'number',
  OBJECT = 'object',
  STRING = 'string',
  SYMBOL = 'symbol',
  TRUE = 'true',
  UNDEFINED = 'undefined',
  UNKNOWN = 'unknown',
  VOID = 'void',
}

export interface PackageMeta {
  pkg: string;
  fileName: string;
  subModuleName: string;
}
