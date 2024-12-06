import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createOutletStep } from "./steps/create-outlet";
import { ProductDTO } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { OUTLET_MODULE } from "../../modules/outlet";
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows";

export type CreateOutletFromProductWorkflowInput = {
    product: ProductDTO;
    additional_data?: {
        is_outlet?: boolean;
    };
};

export const createOutletFromProductWorkflow = createWorkflow(
    "create-outlet-from-product-workflow",
    function (input: CreateOutletFromProductWorkflowInput) {
        const is_outlet = transform({ input }, (data) => data.input.additional_data?.is_outlet ?? false);

        const outlet = createOutletStep({
            is_outlet: is_outlet,
        });

        when({ outlet }, ({ outlet }) => outlet !== undefined).then(() => {
            createRemoteLinkStep([
                {
                    [Modules.PRODUCT]: {
                        product_id: input.product.id,
                    },
                    [OUTLET_MODULE]: {
                        outlet_id: outlet.id,
                    },
                },
            ]);
        });
        return new WorkflowResponse({
            outlet,
        });
    },
);

export default createOutletFromProductWorkflow;
