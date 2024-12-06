import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createAdvancedProductPricesStep } from "./steps/create-advanced-product-prices";
import { ProductDTO } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";
import {ADVANCED_PRODUCT_PRICE_MODULE} from "../../modules/advanced-product-price";

export type CreateAdvancedPricesFromProductWorkflowInput = {
    product: ProductDTO;
    additional_data?: {
        listPrice?: number;
        msrp?: number;
        msp?: number;
    };
};

export const createAdvancedPricesFromProductWorkflow = createWorkflow(
    "create-advanced-prices-from-product-workflow",
    function (input: CreateAdvancedPricesFromProductWorkflowInput) {
        const listPrice = transform({ input }, (data) => data.input.additional_data?.listPrice);
        const msrp = transform({ input }, (data) => data.input.additional_data?.msrp);
        const msp = transform({ input }, (data) => data.input.additional_data?.msp);

        const app = createAdvancedProductPricesStep({
            listPrice: listPrice,
            msrp: msrp,
            msp: msp
        });

        when({ app }, ({ app }) => app !== undefined).then(() => {
            createRemoteLinkStep([
                {
                    [Modules.PRODUCT]: {
                        product_id: input.product.id,
                    },
                    [ADVANCED_PRODUCT_PRICE_MODULE]: {
                        advanced_product_price_id: app.id,
                    },
                },
            ]);
        });
        return new WorkflowResponse({
            app,
        });
    },
);

export default createAdvancedPricesFromProductWorkflow;
