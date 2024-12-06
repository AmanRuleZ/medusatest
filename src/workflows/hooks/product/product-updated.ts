import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import {
    UpdateOutletFromProductStepInput,
    updateOutletFromProductWorkflow
} from "../../update-outlet-from-product";
import {
    UpdateAdvancedPricesFromProductStepInput,
    updateAdvancedPriceFromProductWorkflow
} from "../../update-advanced-prices-from-product";

updateProductsWorkflow.hooks.productsUpdated(
    async ({ products, additional_data }, { container }) => {
        const outletWorkflow = updateOutletFromProductWorkflow(container);
        const advancedPricesWorkflow = updateAdvancedPriceFromProductWorkflow(container);

        for (const product of products) {
            if (additional_data?.is_outlet !== null && additional_data?.is_outlet !== undefined) {
                await outletWorkflow.run({
                    input: {
                        product,
                        additional_data,
                    } as UpdateOutletFromProductStepInput,
                });
            }
            if ((additional_data?.listPrice !== null && additional_data?.listPrice !== undefined) ||
                (additional_data?.msrp !== null && additional_data?.msrp !== undefined) ||
                (additional_data?.msp !== null && additional_data?.msp !== undefined)) {
                await advancedPricesWorkflow.run({
                    input: {
                        product,
                        additional_data,
                    } as UpdateAdvancedPricesFromProductStepInput,
                });
            }
        }
    }
);