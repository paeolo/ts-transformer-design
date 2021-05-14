import ts from 'typescript';

import {
  Container,
} from './types';
import {
  visitorPropertyDeclaration
} from './visitor-property-declaration';

const isDecoratedClassElement = (member: ts.ClassElement, isStatic: boolean, parent: ts.Node) => {
  return (<any>ts).nodeOrChildIsDecorated(member, parent)
    && isStatic === (<any>ts).hasSyntacticModifier(member, ts.ModifierFlags.Static);
}

const isInstanceDecoratedClassElement = (member: ts.ClassElement, parent: ts.Node) => {
  return isDecoratedClassElement(member, false, parent);
}

const getDecoratedClassElements = (node: ts.ClassDeclaration) => {
  return (<any>ts).filter(node.members, (m: ts.ClassElement) => isInstanceDecoratedClassElement(m, node));
}

/**
 * Visit a class declaration
 */
export const classVisitor = (node: ts.ClassDeclaration, container: Container): ts.Node => {
  const members = getDecoratedClassElements(node);

  for (const member of members) {
    if (ts.isPropertyDeclaration(member)) {
      visitorPropertyDeclaration(member, container);
    }
  }

  return node;
}
