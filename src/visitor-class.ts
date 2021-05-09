import ts from 'typescript';

import {
  Container,
} from './types';
import {
  getAddTypeMetadataHelper
} from './utils'

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

export const classVisitor = (node: ts.ClassDeclaration, container: Container): ts.Node => {
  const addTypeMetadata = getAddTypeMetadataHelper(container);
  const members = getDecoratedClassElements(node);

  for (const member of members) {
    if (ts.isPropertyDeclaration(member)) {
      addTypeMetadata(member);
    }
  }

  return node;
}
