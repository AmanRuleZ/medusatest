import { createCartWorkflow, listShippingOptionsForCartWorkflow } from "@medusajs/core-flows";
import { Modules } from "@medusajs/framework/utils";
import {
    ICartModuleService,
    ICustomerModuleService,
    IPaymentModuleService,
    ShippingOptionDTO,
    UpdateCartWorkflowInputDTO,
} from "@medusajs/types";
import { AddShippingMethodToCartWorkflowInput } from "@medusajs/core-flows/dist/cart/workflows/add-shipping-method-to-cart";
import { addShippingMethodToCartWorkflow, updateCartWorkflow } from "@medusajs/medusa/core-flows";

interface ListShippingOptionsResponse {
    result: ShippingOptionDTO[];
}

createCartWorkflow.hooks.cartCreated(async ({ cart, additional_data }, { container }) => {
    const cartService: ICartModuleService = container.resolve(Modules.CART);
    const customerService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);
    const paymentService: IPaymentModuleService = container.resolve(Modules.PAYMENT);

    // SET ADDRESS
    const addresses = await customerService.listCustomerAddresses({ is_default_shipping: true });
    const defaultAddress = addresses[0];
    let updateCartWorkflowInputDTO: UpdateCartWorkflowInputDTO = {
        id: cart.id,
        shipping_address: {
            city: defaultAddress.city,
            address_1: defaultAddress.address_1,
            address_2: defaultAddress.address_2,
            company: defaultAddress.company,
            customer_id: defaultAddress.customer_id,
            country_code: defaultAddress.country_code,
            first_name: defaultAddress.first_name,
            last_name: defaultAddress.last_name,
            phone: defaultAddress.phone,
            province: defaultAddress.province,
            postal_code: defaultAddress.postal_code,
            metadata: defaultAddress.metadata,
        },
    };

    await updateCartWorkflow(container).run({ input: updateCartWorkflowInputDTO });

    //SET SHIPPING METHOD
    const originalCart = await cartService.retrieveCart(cart.id, {
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

    const { result } = await listShippingOptionsForCartWorkflow(container).run({
        input: {
            cart_id: originalCart.id,
            sales_channel_id: originalCart.sales_channel_id,
            currency_code: originalCart.currency_code,
            region_id: originalCart.region_id,
            is_return: false,
            shipping_address: {
                city: originalCart.shipping_address?.city,
                country_code: originalCart.shipping_address?.country_code,
                province: originalCart.shipping_address?.province,
            },
        },
    });

    if (result.length > 0) {
        const addShippingMethodWorkflowInput: AddShippingMethodToCartWorkflowInput = {
            cart_id: originalCart.id,
            options: [
                {
                    id: result[0].id,
                },
            ],
        };

        await addShippingMethodToCartWorkflow(container).run({ input: addShippingMethodWorkflowInput });
    }
});
