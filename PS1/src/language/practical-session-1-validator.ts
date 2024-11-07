import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { PracticalSession1AstType, Person } from './generated/ast.js';
import type { PracticalSession1Services } from './practical-session-1-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PracticalSession1Services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PracticalSession1Validator;
    const checks: ValidationChecks<PracticalSession1AstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class PracticalSession1Validator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
