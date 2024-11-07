import { NodeFileSystem } from 'langium/node';
import { Def, Expr, isBinExpr, isColor, isFor, isGroup, isLit, isMacro, isMove, isNegExpr, isPen, isRef, type Model, type Stmt } from '../language/generated/ast.js';
import { createMiniLogoServices } from '../language/practical-session-3-module.js';

type MiniLogoGenEnv = Map<string, number>;

export function generateJSON(model: Model): string {
    const services = createMiniLogoServices(NodeFileSystem).miniLogoServices;
    const json = services.serializer.JsonSerializer.serialize(model);
    return json;
}

type GeneratedCommand = Pen | Move | Color;

type Pen = {
    cmd: 'penUp' | 'penDown'
};

type Move = {
    cmd: 'move',
    x: number,
    y: number
};

type Color = { cmd: 'color' } & (ColorString | ColorRGB);

type ColorString = {
    color: string
};

type ColorRGB = {
    r: number,
    g: number,
    b: number
};

export function generateCommands(model: Model): GeneratedCommand[] {
    const env: MiniLogoGenEnv = new Map<string, number>();
    const result: GeneratedCommand[] = generateStatements(model.stmts, env);
    return result;
}

function generateStatements(stmts: Stmt[], env: MiniLogoGenEnv): GeneratedCommand[] {
    const generatedCmds: GeneratedCommand[] = [];
    for (const stmt of stmts) {
        if (isPen(stmt)) {
            generatedCmds.push({
                cmd: stmt.mode === 'up' ? 'penUp' : 'penDown'
            });
        } else if (isMove(stmt)) {
            generatedCmds.push({
                cmd: 'move',
                x: evalExprWithEnv(stmt.ex, env),
                y: evalExprWithEnv(stmt.ey, env)
            });
        } else if (isMacro(stmt)) {
            const macro: Def = stmt.def.ref as Def;
            let macroEnv = new Map(env);
            let tmpEnv = new Map<string, number>();
            macro.params.map((elm, idx: number) => tmpEnv.set(elm.name, evalExprWithEnv(stmt.args[idx], macroEnv)));
            tmpEnv.forEach((v, k) => macroEnv.set(k, v));
            generatedCmds.push(...generateStatements(macro.body, env));
        } else if (isFor(stmt)) {
            let vi = evalExprWithEnv(stmt.e1, env);
            let ve = evalExprWithEnv(stmt.e2, env);
            let results: GeneratedCommand[] = [];
            const loopEnv = new Map(env);
            while (vi < ve) {
                loopEnv.set(stmt.var.name, vi++);
                results = results.concat(...generateStatements(stmt.body, new Map(loopEnv)));
            }
            generatedCmds.push(...results);
        } else if (isColor(stmt)) {
            if (stmt.color) {
                generatedCmds.push({
                    cmd: 'color',
                    color: stmt.color
                });
            } else {
                const r = evalExprWithEnv(stmt.r!, env);
                const g = evalExprWithEnv(stmt.g!, env);
                const b = evalExprWithEnv(stmt.b!, env);
                generatedCmds.push({
                    cmd: 'color',
                    r, g, b
                });
            }
        } else {
            throw new Error('Missing handling for statement');
        }
    }
    return generatedCmds;
}

function evalExprWithEnv(e: Expr, env: MiniLogoGenEnv): number {
    if (isLit(e)) {
        return e.val;
    } else if (isRef(e)) {
        const v = env.get(e.val.ref?.name ?? '');
        if (v !== undefined) {
            return v;
        } else {
            throw new Error('Unable to resolve reference to undefined symbol: ' + e.val.$refText);
        }
    } else if (isBinExpr(e)) {
        let opval = e.op;
        let v1 = evalExprWithEnv(e.e1, env);
        let v2 = evalExprWithEnv(e.e2, env);
        switch (opval) {
            case '+': return v1 + v2;
            case '-': return v1 - v2;
            case '*': return v1 * v2;
            case '/': return v1 / v2;
            default: throw new Error(`Unrecognized bin op passed: ${opval}`);
        }
    } else if (isNegExpr(e)) {
        return -1 * evalExprWithEnv(e.ne, env);
    } else if (isGroup(e)) {
        return evalExprWithEnv(e.ge, env);
    } else {
        throw new Error('invalid expression lol');
    }
}