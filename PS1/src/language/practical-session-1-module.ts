import { type Module, inject } from 'langium';
import { createDefaultModule, createDefaultSharedModule, type DefaultSharedModuleContext, type LangiumServices, type LangiumSharedServices, type PartialLangiumServices } from 'langium/lsp';
import { PracticalSession1GeneratedModule, PracticalSession1GeneratedSharedModule } from './generated/module.js';
import { PracticalSession1Validator, registerValidationChecks } from './practical-session-1-validator.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type PracticalSession1AddedServices = {
    validation: {
        PracticalSession1Validator: PracticalSession1Validator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type PracticalSession1Services = LangiumServices & PracticalSession1AddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const PracticalSession1Module: Module<PracticalSession1Services, PartialLangiumServices & PracticalSession1AddedServices> = {
    validation: {
        PracticalSession1Validator: () => new PracticalSession1Validator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createPracticalSession1Services(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    PracticalSession1: PracticalSession1Services
} {
    const shared = inject(
        createDefaultSharedModule(context),
        PracticalSession1GeneratedSharedModule
    );
    const PracticalSession1 = inject(
        createDefaultModule({ shared }),
        PracticalSession1GeneratedModule,
        PracticalSession1Module
    );
    shared.ServiceRegistry.register(PracticalSession1);
    registerValidationChecks(PracticalSession1);
    if (!context.connection) {
        // We don't run inside a language server
        // Therefore, initialize the configuration provider instantly
        shared.workspace.ConfigurationProvider.initialized({});
    }
    return { shared, PracticalSession1 };
}
