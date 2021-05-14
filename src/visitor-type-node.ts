import ts from 'typescript';

import {
  Container
} from './types';
import {
  wrapExpression,
  getGlobalBigIntNameWithFallback,
  getGlobalSymbolNameWithFallback
} from './utils'
import {
  visitorTypeReference
} from './visitor-type-reference'

export const visitorTypeNode = (node: ts.TypeNode | undefined, container: Container): ts.ObjectLiteralExpression => {
  const factory = container.context.factory;
  const languageVersion = container.languageVersion;

  if (node === undefined) {
    return wrapExpression(factory.createIdentifier('Object'));
  }

  switch (node.kind) {
    case ts.SyntaxKind.VoidKeyword:
    case ts.SyntaxKind.UndefinedKeyword:
    case ts.SyntaxKind.NeverKeyword:
      return wrapExpression(factory.createVoidZero());

    case ts.SyntaxKind.ParenthesizedType:
      return visitorTypeNode((<any>node).type, container);

    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.ConstructorType:
      return wrapExpression(factory.createIdentifier('Function'));

    case ts.SyntaxKind.ArrayType:
      return wrapExpression(
        factory.createIdentifier('Array'),
        visitorTypeNode((<any>node).elementType, container)
      );
    case ts.SyntaxKind.TupleType:
      return wrapExpression(
        factory.createIdentifier('Array'),
        factory.createArrayLiteralExpression(
          (<any>node).elements.map((value: ts.TypeNode) => {
            if (ts.isNamedTupleMember(value)) {
              return visitorTypeNode(value.type, container);
            }
            else {
              return visitorTypeNode(value, container)
            }
          })
        ));

    case ts.SyntaxKind.TypePredicate:
    case ts.SyntaxKind.BooleanKeyword:
      return wrapExpression(factory.createIdentifier('Boolean'));

    case ts.SyntaxKind.StringKeyword:
      return wrapExpression(factory.createIdentifier('String'));

    case ts.SyntaxKind.ObjectKeyword:
      return wrapExpression(factory.createIdentifier('Object'));

    case ts.SyntaxKind.LiteralType:
      switch ((<any>node).literal.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
          return wrapExpression(factory.createIdentifier('String'));

        case ts.SyntaxKind.PrefixUnaryExpression:
        case ts.SyntaxKind.NumericLiteral:
          return wrapExpression(factory.createIdentifier('Number'));

        case ts.SyntaxKind.BigIntLiteral:
          return wrapExpression(getGlobalBigIntNameWithFallback(languageVersion, factory));

        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
          return wrapExpression(factory.createIdentifier('Boolean'));

        case ts.SyntaxKind.NullKeyword:
          return wrapExpression(factory.createNull());

        default:
          return (<any>ts).Debug.failBadts.SyntaxKind((<any>node).literal);
      }

    case ts.SyntaxKind.NumberKeyword:
      return wrapExpression(factory.createIdentifier('Number'));

    case ts.SyntaxKind.BigIntKeyword:
      return wrapExpression(getGlobalBigIntNameWithFallback(languageVersion, factory));

    case ts.SyntaxKind.SymbolKeyword:
      return wrapExpression(
        languageVersion < ts.ScriptTarget.ES2015
          ? getGlobalSymbolNameWithFallback(factory)
          : factory.createIdentifier('Symbol')
      );

    case ts.SyntaxKind.TypeReference:
      return visitorTypeReference(<ts.TypeReferenceNode>node, container);

    case ts.SyntaxKind.IntersectionType:
      return wrapExpression(
        factory.createStringLiteral('ALL_OF'),
        factory.createArrayLiteralExpression(
          (<any>node).types.map((value: ts.TypeNode) => visitorTypeNode(value, container))
        )
      );
    case ts.SyntaxKind.UnionType:
      return wrapExpression(
        factory.createStringLiteral('ONE_OF'),
        factory.createArrayLiteralExpression(
          (<any>node).types.map((value: ts.TypeNode) => visitorTypeNode(value, container))
        )
      );

    case ts.SyntaxKind.ConditionalType:
      return wrapExpression(
        factory.createStringLiteral('ONE_OF'),
        factory.createArrayLiteralExpression(
          [(<any>node).trueType, (<any>node).falseType].map(value => visitorTypeNode(value, container))
        )
      );

    case ts.SyntaxKind.TypeOperator:
      if ((<any>node).operator === ts.SyntaxKind.ReadonlyKeyword) {
        return visitorTypeNode((<any>node).type, container);
      }
      break;

    case ts.SyntaxKind.TypeQuery:
    case ts.SyntaxKind.IndexedAccessType:
    case ts.SyntaxKind.MappedType:
    case ts.SyntaxKind.TypeLiteral:
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
    case ts.SyntaxKind.ThisType:
    case ts.SyntaxKind.ImportType:
      break;

    // handle JSDoc types from an invalid parse
    case ts.SyntaxKind.JSDocAllType:
    case ts.SyntaxKind.JSDocUnknownType:
    case ts.SyntaxKind.JSDocFunctionType:
    case ts.SyntaxKind.JSDocVariadicType:
    case ts.SyntaxKind.JSDocNamepathType:
      break;

    case ts.SyntaxKind.JSDocNullableType:
    case ts.SyntaxKind.JSDocNonNullableType:
    case ts.SyntaxKind.JSDocOptionalType:
      return visitorTypeNode((<any>node).type, container);
    default:
      return (<any>ts).Debug.failBadts.SyntaxKind(node);
  }

  return wrapExpression(factory.createIdentifier('Object'));
}
