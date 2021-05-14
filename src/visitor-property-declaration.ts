import ts from 'typescript';

import {
  visitorType
} from './visitor-type'
import {
  METADATA_KEY,
  Container
} from './types';

/**
 * Visit a property declaration
 */
export const visitorPropertyDeclaration = (node: ts.PropertyDeclaration, container: Container) => {
  if (!node.decorators || node.decorators.length === 0) {
    return;
  }

  const factory = container.context.factory;
  const getEmitHelperFactory = (<any>container.context).getEmitHelperFactory;

  const serializeTypeOfPropertyDeclaration = (node: ts.PropertyDeclaration) => {
    const objectLiteralExpression = visitorType(node.type, container);

    if (!node.questionToken) {
      const properties = objectLiteralExpression.properties;
      (<any>properties).push(
        factory.createPropertyAssignment(
          'required',
          factory.createTrue()
        )
      );

      factory.updateObjectLiteralExpression(
        objectLiteralExpression,
        properties
      );
    }

    return objectLiteralExpression;
  }

  const serializeTypeOfNode = (node: ts.PropertyDeclaration) => {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        return serializeTypeOfPropertyDeclaration(node);
      default:
        return factory.createVoidZero();
    }
  }

  const createTypeMedataExpression = (node: ts.Expression) => getEmitHelperFactory()
    .createMetadataHelper(
      METADATA_KEY,
      factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        node
      )
    );

  const typeExpression = serializeTypeOfNode(node);

  (<any>node.decorators).push(
    factory.createDecorator(createTypeMedataExpression(typeExpression))
  );
}
