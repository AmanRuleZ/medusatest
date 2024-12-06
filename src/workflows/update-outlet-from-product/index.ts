import {ProductDTO} from "@medusajs/framework/types";
import {createWorkflow, when, WorkflowResponse} from "@medusajs/framework/workflows-sdk";
import {createRemoteLinkStep, useQueryGraphStep} from "@medusajs/medusa/core-flows";
import {createOutletStep} from "../create-outlet-from-product/steps/create-outlet";
import {Modules} from "@medusajs/framework/utils";
import {OUTLET_MODULE} from "../../modules/outlet";
import {updateOutletStep} from "./steps/update-outlet";

export type UpdateOutletFromProductStepInput = {
    product: ProductDTO;
    additional_data?: {
        is_outlet?: boolean | false;
    };
};

export const updateOutletFromProductWorkflow = createWorkflow(
    "update-outlet-from-product",
    (input: UpdateOutletFromProductStepInput) => {
        const {data: products} = useQueryGraphStep({
            entity: "product",
            fields: ["outlet.*"],
            filters: {
                id: input.product.id,
            },
        });

        const created = when(
            {
                input,
                products,
            },
            (data) => data.products[0].outlet !== null && !data.products[0].outlet,
        ).then(() => {
            const outlet = createOutletStep({
                is_outlet: input.additional_data?.is_outlet,
            });

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

            return outlet;
        });

        const updated = when(
            {
                input,
                products,
            },
            (data) => data.products[0].outlet !== null && data.products[0].outlet,
        ).then(() => {
            return updateOutletStep({
                id: products[0].outlet.id,
                is_outlet: input.additional_data?.is_outlet || false,
            });
        });
        console.log("Outlet updated");
        return new WorkflowResponse({
            updated,
            created,
        });
    },
);
