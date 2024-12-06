import { ProductDTO } from "@medusajs/framework/types";
import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import {
    createAdvancedProductPricesStep,
} from "../create-advanced-prices-from-product/steps/create-advanced-product-prices";
import { Modules } from "@medusajs/framework/utils";
import { updateAdvancedProductPriceStep } from "./steps/update-advanced-product-prices";
import {ADVANCED_PRODUCT_PRICE_MODULE} from "../../modules/advanced-product-price";

export type UpdateAdvancedPricesFromProductStepInput = {
    product: ProductDTO;
    additional_data?: {
        listPrice?: number;
        msrp?: number;
        msp?: number;
    };
};

export const updateAdvancedPriceFromProductWorkflow = createWorkflow(
    "update-advanced-price-from-product",
    (input: UpdateAdvancedPricesFromProductStepInput) => {
        const { data: products } = useQueryGraphStep({
            entity: "product",
            fields: ["advanced_product_prices.*"],
            filters: {
                id: input.product.id,
            },
        });
        const created = when(
            {
                input,
                products,
            },
            (data) => data.products[0].advanced_product_price !== null && !data.products[0].advanced_product_price,
        ).then(() => {
            const app = createAdvancedProductPricesStep({
                listPrice: input.additional_data?.listPrice,
                msrp: input.additional_data?.msrp,
                msp: input.additional_data?.msp
            });

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

            return app;
        });

        const updated = when(
            {
                input,
                products,
            },
            (data) => data.products[0].advancedProductPrices !== null && data.products[0].advancedProductPrices,
        ).then(() => {
            const app = updateAdvancedProductPriceStep({
                id: products[0].advancedProductPrices.id,
                listPrice: input.additional_data?.listPrice,
                msrp: input.additional_data?.msrp,
                msp: input.additional_data?.msp
            });

            return app;
        });
        console.log("Advanced product price updated");
        return new WorkflowResponse({
            updated,
            created,
        });
    },
);
