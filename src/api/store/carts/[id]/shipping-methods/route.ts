import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { StoreAddCartShippingMethodsType } from "@medusajs/medusa/api/store/carts/validators";
import { ICartModuleService, ShippingOptionDTO, StoreCartResponse } from "@medusajs/types";
import { Modules } from "@medusajs/framework/utils";
import { listShippingOptionsForCartWorkflow } from "@medusajs/core-flows";
import { MedusaError } from "@medusajs/utils";
import { addShippingMethodToCartWorkflow } from "@medusajs/medusa/core-flows";
import { refetchCart } from "@medusajs/medusa/api/store/carts/helpers";

export const POST = async (
    req: MedusaRequest<StoreAddCartShippingMethodsType>,
    res: MedusaResponse<StoreCartResponse>,
) => {
    // TODO: Extend ShippingMethod model with additional ID and use it to set it on cart. Currently this model can't be extended.
    // This is temporary workaround to set shipping method using name field on ShippingMethod.

    const cart_id = req.params.id;
    const option_id = req.body.option_id;

    const cartModuleService: ICartModuleService = await req.scope.resolve(Modules.CART);

    const cart = await cartModuleService.retrieveCart(cart_id, {
        select: [
            "id",
            "sales_channel_id",
            "currency_code",
            "region_id",
            "shipping_address.city",
            "shipping_address.country_code",
            "shipping_address.province",
        ],
        relations: ["shipping_address"],
    });

    const { result } = await listShippingOptionsForCartWorkflow(req.scope).run({
        input: {
            cart_id: cart.id,
            sales_channel_id: cart.sales_channel_id,
            currency_code: cart.currency_code,
            region_id: cart.region_id,
            is_return: false,
            shipping_address: {
                city: cart.shipping_address?.city,
                country_code: cart.shipping_address?.country_code,
                province: cart.shipping_address?.province,
            },
        },
    });

    if (result.length > 0) {
        const shippingOptions: ShippingOptionDTO[] = result;
        const selectedOption = shippingOptions.find((option) => option.name === option_id);
        if (selectedOption) {
            await addShippingMethodToCartWorkflow(req.scope).run({
                input: {
                    options: [{ id: selectedOption.id, data: undefined }],
                    cart_id,
                },
            });

            const cart = await refetchCart(cart_id, req.scope, req?.remoteQueryConfig?.fields);

            res.status(200).json({ cart });
        } else {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, `Shipping method with id ${option_id} not found`);
        }
    }
};
