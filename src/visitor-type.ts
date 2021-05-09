import ts from 'typescript';

import {
  Container
} from './types';
import {
  wrapper,
  getGlobalBigIntNameWithFallback,
  getGlobalSymbolNameWithFallback
} from './utils'
import {
  visitorTypeReference
} from './visitor-type-reference'

export const visitorType = (node: ts.TypeNode | undefined, container: Container): ts.ObjectLiteralExpression => {
  const factory = container.context.factory;
  const languageVersion = container.languageVersion;

  if (node === undefined) {
    return wrapper(factory.createIdentifier('Object'));
  }

  switch (node.kind) {
    case ts.SyntaxKind.VoidKeyword:
    case ts.SyntaxKind.UndefinedKeyword:
    case ts.SyntaxKind.NeverKeyword:
      return wrapper(factory.createVoidZero());

    case ts.SyntaxKind.ParenthesizedType:
      return visitorType((<any>node).type, container);

    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.ConstructorType:
      return wrapper(factory.createIdentifier('Function'));

    case ts.SyntaxKind.ArrayType:
      return wrapper(
        factory.createIdentifier('Array'),
        visitorType((<any>node).elementType, container)
      );
    case ts.SyntaxKind.TupleType:
      return wrapper(
        factory.createIdentifier('Array'),
        factory.createArrayLiteralExpression(
          (<any>node).elements.map((value: ts.TypeNode) => {
            if (ts.isNamedTupleMember(value)) {
              return visitorType(value.type, container);
            }
            else {
              return visitorType(value, container)
            }
          })
        ));

    case ts.SyntaxKind.TypePredicate:
    case ts.SyntaxKind.BooleanKeyword:
      return wrapper(factory.createIdentifier('Boolean'));

    case ts.SyntaxKind.StringKeyword:
      return wrapper(factory.createIdentifier('String'));

    case ts.SyntaxKind.ObjectKeyword:
      return wrapper(factory.createIdentifier('Object'));

    case ts.SyntaxKind.LiteralType:
      switch ((<any>node).literal.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
          return wrapper(factory.createIdentifier('String'));

        case ts.SyntaxKind.PrefixUnaryExpression:
        case ts.SyntaxKind.NumericLiteral:
          return wrapper(factory.createIdentifier('Number'));

        case ts.SyntaxKind.BigIntLiteral:
          return wrapper(getGlobalBigIntNameWithFallback(languageVersion, factory));

        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
          return wrapper(factory.createIdentifier('Boolean'));

        case ts.SyntaxKind.NullKeyword:
          return wrapper(factory.createNull());

        default:
          return (<any>ts).Debug.failBadts.SyntaxKind((<any>node).literal);
      }

    case ts.SyntaxKind.NumberKeyword:
      return wrapper(factory.createIdentifier('Number'));

    case ts.SyntaxKind.BigIntKeyword:
      return wrapper(getGlobalBigIntNameWithFallback(languageVersion, factory));

    case ts.SyntaxKind.SymbolKeyword:
      return wrapper(
        languageVersion < ts.ScriptTarget.ES2015
          ? getGlobalSymbolNameWithFallback(factory)
          : factory.createIdentifier('Symbol')
      );

    case ts.SyntaxKind.TypeReference:
      return visitorTypeReference(<ts.TypeReferenceNode>node, container);

    case ts.SyntaxKind.IntersectionType:
      return wrapper(
        factory.createStringLiteral('ALL_OF'),
        factory.createArrayLiteralExpression(
          (<any>node).types.map((value: ts.TypeNode) => visitorType(value, container))
        )
      );
    case ts.SyntaxKind.UnionType:
      return wrapper(
        factory.createStringLiteral('ONE_OF'),
        factory.createArrayLiteralExpression(
          (<any>node).types.map((value: ts.TypeNode) => visitorType(value, container))
        )
      );

    case ts.SyntaxKind.ConditionalType:
      return wrapper(
        factory.createStringLiteral('ONE_OF'),
        factory.createArrayLiteralExpression(
          [(<any>node).trueType, (<any>node).falseType].map(value => visitorType(value, container))
        )
      );

    case ts.SyntaxKind.TypeOperator:
      if ((<any>node).operator === ts.SyntaxKind.ReadonlyKeyword) {
        return visitorType((<any>node).type, container);
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
      return visitorType((<any>node).type, container);
    default:
      return (<any>ts).Debug.failBadts.SyntaxKind(node);
  }

  return wrapper(factory.createIdentifier('Object'));
}
