import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/core-flows";
import deleteCartStep from "./steps/delete-cart";

type WorkflowInput = {
    cart_id: string;
};

const deleteCartWorkflow = createWorkflow("delete-cart", (input: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
        entity: "cart",
        fields: ["id"],
        filters: { id: input.cart_id },
        options: {
            throwIfKeyNotFound: true,
        },
    });

    deleteCartStep({
        cart: carts[0],
    });

    return new WorkflowResponse({
        success: true,
    });
});

export default deleteCartWorkflow;
