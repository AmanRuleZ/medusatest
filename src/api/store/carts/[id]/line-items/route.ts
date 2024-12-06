import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { StoreAddCartLineItemType } from "@medusajs/medusa/api/store/carts/validators";
import { StoreCartResponse } from "@medusajs/types";
import { refetchCart } from "@medusajs/medusa/api/store/carts/helpers";
import { addToCartWorkflow } from "@medusajs/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { CustomStoreAddCartLineItemType } from "../../validators";

/**
 * Overridden default endpoint to be able to add item using sku.
 */
export const POST = async (
    req: MedusaRequest<CustomStoreAddCartLineItemType>,
    res: MedusaResponse<StoreCartResponse>,
) => {
    const query: RemoteQueryFunction = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: products } = await query.graph({
        entity: "product_variant",
        fields: ["id"],
        filters: {
            sku: req.body.sku,
        },
    });

    const body: StoreAddCartLineItemType = {
        variant_id: products[0].id,
        quantity: req.body.quantity,
    };

    const cart = await refetchCart(req.params.id, req.scope, req.remoteQueryConfig.fields);

    const workflowInput = {
        items: [body],
        cart,
    };

    await addToCartWorkflow(req.scope).run({
        input: workflowInput,
    } as any);

    const updatedCart = await refetchCart(req.params.id, req.scope, req.remoteQueryConfig.fields);

    res.status(200).json({ cart: updatedCart });
};
