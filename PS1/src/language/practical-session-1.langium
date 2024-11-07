grammar PracticalSession1

entry Model: (expressions += Expression)+;

Expression: SelectExpression (('UNION' right=SelectExpression)*)?;

SelectExpression: 'SELECT' columns = ColumnList 'FROM' table=ID (whereClause += WhereClause)?;

WhereClause: 'WHERE' condition=Condition;

ColumnList: columns += ID (',' columns += ID)*;

Condition: OrCondition;

OrCondition: AndCondition (('OR' AndCondition)*)?;

AndCondition: NotCondition (('AND' NotCondition)*)?;

NotCondition: ('NOT' NotCondition) | PrimaryCondition;

PrimaryCondition: ComparisonCondition | ExistsCondition;

ComparisonCondition: left=Value operator=ComparisonOperator right=Value;

ExistsCondition: 'EXISTS' '(' subquery=SelectExpression ')'; 

ComparisonOperator: op = ('=' | '<' | '>' | '<>');

Value: val = (ID | INT);

terminal HEX returns string: /#(\d|[a-fA-F])+/;
terminal ID returns string: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /-?[0-9]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
