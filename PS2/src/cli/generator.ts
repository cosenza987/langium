import type { CDDrive, Component, GraphicsCard, HardDisk, Memory, Model, Motherboard, Peripheral, PowerSupply, Processor } from '../language/generated/ast.js';

export function generateModelJSON(model: Model): object {
    return {
        definitions: model.defs.map(def => ({
            name: def.name,
            components: def.body.map(component => describeComponent(component))
        }))
    };
}

// Describe each component as a JSON object
function describeComponent(component: Component): object {
    switch (component.$type) {
        case 'Motherboard':
            const motherboard = component as Motherboard;
            return {
                type: 'Motherboard',
                name: motherboard.name,
                processorType: motherboard.processorType,
                ramType: motherboard.ramType,
                wattage: motherboard.wattage,
                ports: motherboard.ports
            };

        case 'Processor':
            const processor = component as Processor;
            return {
                type: 'Processor',
                name: processor.name,
                processorType: processor.processorType,
                wattage: processor.wattage
            };

        case 'GraphicsCard':
            const gpu = component as GraphicsCard;
            return {
                type: 'GraphicsCard',
                name: gpu.name,
                wattage: gpu.wattage
            };

        case 'Memory':
            const memory = component as Memory;
            return {
                type: 'Memory',
                amount: memory.amount,
                clock: memory.clock,
                ramType: memory.ramType
            };

        case 'HardDisk':
            const hardDisk = component as HardDisk;
            return {
                type: 'HardDisk',
                sizes: hardDisk.values
            };

        case 'CDDrive':
            const cdDrive = component as CDDrive;
            return {
                type: 'CDDrive',
                amount: cdDrive.amount
            };

        case 'Peripheral':
            const peripheral = component as Peripheral;
            return {
                type: 'Peripheral',
                peripherals: peripheral.peripherals.map((p, i) => ({
                    name: p,
                    port: peripheral.ports[i]
                }))
            };

        case 'PowerSupply':
            const powerSupply = component as PowerSupply;
            return {
                type: 'PowerSupply',
                wattage: powerSupply.wattage
            };

        default:
            return { type: 'Unknown' };
    }
}