import ts from 'typescript';

export const wrapper = (type: ts.Expression, items?: ts.Expression, title?: string) => {
  const expressions = [
    ts.factory.createPropertyAssignment('type', type)
  ];

  if (items) {
    expressions.push(ts.factory.createPropertyAssignment('items', items));
  }

  if (title) {
    expressions.push(
      ts.factory.createPropertyAssignment(
        'title',
        ts.factory.createStringLiteral(title, true)
      )
    );
  }

  return ts.factory.createObjectLiteralExpression(expressions);
}
