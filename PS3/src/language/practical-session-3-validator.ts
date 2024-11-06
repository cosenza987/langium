import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { MiniLogoServices } from './practical-session-3-module.js';
import { Def, Model, PracticalSession3AstType } from './generated/ast.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MiniLogoServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MiniLogoValidator;
    const checks: ValidationChecks<PracticalSession3AstType> = {
        Model: validator.checkModel,
        Def: validator.checkDef,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MiniLogoValidator {

    checkModel(model: Model, accept: ValidationAcceptor): void {
        const defs = model.defs;
        const previousNames = new Set<string>();
        for (const def of defs) {
            if (previousNames.has(def.name.toLowerCase())) {
                accept('error', 'Definition cannot re-define an existing definition.', { node: def, property: 'name' });
            } else {
                previousNames.add(def.name.toLowerCase());
            }
        }
    }

    /**
     * 
     * @param def 
     *  
     * @param accept 
     */
    checkDef(def: Def, accept: ValidationAcceptor): void {
        const params = def.params;
        const previousNames = new Set<string>();
        for (const param of params) {
            if (previousNames.has(param.name.toLowerCase())) {
                accept('error', `Duplicate parameter name '${param.name}'`, { node: param, property: 'name' });
            } else {
                previousNames.add(param.name.toLowerCase());
            }
        }
    }

}