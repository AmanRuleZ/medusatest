import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import {
    createOutletFromProductWorkflow,
    CreateOutletFromProductWorkflowInput,
} from "../../create-outlet-from-product";
import {
    createAdvancedPricesFromProductWorkflow,
    CreateAdvancedPricesFromProductWorkflowInput,
} from "../../create-advanced-prices-from-product";

createProductsWorkflow.hooks.productsCreated(async ({ products, additional_data }, { container }) => {
    const outletWorkflow = createOutletFromProductWorkflow(container);
    const advancedPricesWorkflow = createAdvancedPricesFromProductWorkflow(container);

    for (const product of products) {
        await outletWorkflow.run({
            input: {
                product,
                additional_data,
            } as CreateOutletFromProductWorkflowInput,
        });

        await advancedPricesWorkflow.run({
            input: {
                product,
                additional_data,
            } as CreateAdvancedPricesFromProductWorkflowInput,
        });
    }
});