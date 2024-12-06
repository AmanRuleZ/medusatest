import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import deleteCartWorkflow from "../../../../workflows/cart/delete-cart";

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const cart_id = req.params.id;

    await deleteCartWorkflow(req.scope).run({
        input: {
            cart_id,
        },
    });

    res.status(200).json(undefined);
};
