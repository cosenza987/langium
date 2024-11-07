import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Component, Def, Model, Motherboard, Peripheral, PowerSupply, PracticeSession2AstType, Processor, } from './generated/ast.js';
import type { PracticeSession2Services } from './practice-session-2-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: PracticeSession2Services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.PracticeSession2Validator;
    const checks: ValidationChecks<PracticeSession2AstType> = {
        Model: validator.checkModelCompatibility,
        Def: validator.checkDefs,
        Motherboard: validator.checkMotherboardPorts,
        PowerSupply: validator.checkPowerConsumption
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class PracticeSession2Validator {
    checkDefs(def: Def, accept: ValidationAcceptor): void {
        const params = def.body;
        const previousNames = new Set<string>();
        for (const param of params) {
            if (previousNames.has(param.$type)) {
                accept('error', `Duplicate parameter name '${param.$type}'`, { node: param, property: 'name' });
            } else {
                previousNames.add(param.$type);
            }
        }
    }
    checkModelCompatibility(model: Model, accept: ValidationAcceptor): void {
        const defs = model.defs;
        const previousNames = new Set<string>();
        for (const def of defs) {
            if (previousNames.has(def.name.toLowerCase())) {
                accept('error', 'Definition cannot re-define an existing definition.', { node: def, property: 'name' });
            } else {
                previousNames.add(def.name.toLowerCase());
            }
        }

        const motherboard = model.defs.flatMap(d => d.body).find(c => c.$type === 'Motherboard') as Motherboard;
        const processor = model.defs.flatMap(d => d.body).find(c => c.$type === 'Processor') as Processor;

        if (motherboard && processor) {
            if (motherboard.processorType !== processor.processorType) {
                accept('error', `Processor type ${processor.processorType} is not compatible with motherboard type ${motherboard.processorType}.`, {
                    node: motherboard,
                    property: 'processorType'
                });
            }
        }
    }
    checkMotherboardPorts(motherboard: Motherboard, accept: ValidationAcceptor): void {
        const def = motherboard.$container as Def;
        const model = def.$container as Model;
        const peripherals = model.defs.flatMap(d => d.body).filter(c => c.$type === 'Peripheral') as Peripheral[];

        peripherals.forEach(peripheral => {
            // Iterate over each (peripheral, port) pair
            for (let i = 0; i < peripheral.peripherals.length; i++) {
                const requiredPeripheral = peripheral.peripherals[i];
                const requiredPort = peripheral.ports[i];

                // Ensure required port is available on the motherboard
                if (!motherboard.ports.includes(requiredPort)) {
                    accept('error', `Motherboard does not have the required port type ${requiredPort} for peripheral ${requiredPeripheral}.`, {
                        node: motherboard,
                        property: 'ports'
                    });
                }
            }
        });
    }
    checkPowerConsumption(powerSupply: PowerSupply, accept: ValidationAcceptor): void {
        const def = powerSupply.$container as Def;
        const model = def.$container as Model;
        const components = model.defs.flatMap(d => d.body) as Component[];
        let totalWattage = 0;

        components.forEach(component => {
            if ('wattage' in component && typeof component.wattage === 'number') {
                totalWattage += component.wattage;
            }
        });

        if (totalWattage > powerSupply.wattage) {
            accept('error', `Total power consumption (${totalWattage}W) exceeds power supply capacity (${powerSupply.wattage}W).`, {
                node: powerSupply,
                property: 'wattage'
            });
        }
    }
}
