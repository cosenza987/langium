grammar PracticeSession2

entry Model: (defs += Def)*;

Component: Motherboard | Processor | GraphicsCard | Memory | HardDisk | CDDrive | Peripheral | PowerSupply;

Def: 'def' name=ID '(' ')' Block;

fragment Block: '{' (body+=Component)* '}';

Motherboard: 'motherboard' '(' (name=ID ',' processorType=ID ',' ramType=ID ',' wattage=INT (',' ports+=Ports)*) ')';

Ports: type = ('USB' | 'PS/2');

Processor: 'processor' '(' name=ID ',' processorType=ID ',' wattage=INT ')';

GraphicsCard: 'gpu' '(' name=ID ',' wattage=INT ')';

Memory: 'memory' '(' amount=INT ',' clock=INT ',' ramType=ID ')';

HardDisk: 'hd' '(' (values+=INT (',' values+=INT)*) ')';

CDDrive: 'cd' '(' amount=INT ')';

Peripheral: 'peripherals' '(' (peripherals+=ID '-' ports+=Ports (',' peripherals+=ID '-' ports+=Ports)*) ')';

PowerSupply: 'psu' '(' wattage=INT ')';

terminal HEX returns string: /#(\d|[a-fA-F])+/;
terminal ID returns string: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /-?[0-9]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;