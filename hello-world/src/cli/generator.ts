import type { Model } from '../language/generated/ast.js';

export function generate(model: Model): string {
    console.dir(model);
    const length = model.stmts.length;
    return length.toString(); 
}
