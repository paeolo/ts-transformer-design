import ts from 'typescript';

import {
  Container
} from './types';
import {
  classVisitor
} from './visitor-class'

export const visitor = (node: ts.Node, container: Container): ts.Node => {
  if (ts.isClassDeclaration(node)) {
    return classVisitor(node, container);
  }

  return ts.visitEachChild(node, node => visitor(node, container), container.context);
}
