import { updateCartWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { ICartModuleService, ICustomerModuleService, UpdateCartWorkflowInputDTO } from "@medusajs/types";

updateCartWorkflow.hooks.cartUpdated(async ({ cart, additional_data }, { container }) => {
    if (additional_data?.shipping_address_id) {
        const cartService: ICartModuleService = container.resolve(Modules.CART);
        const customerService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);

        const addresses = await customerService.listCustomerAddresses({ id: additional_data.shipping_address_id });

        //Cart needs to be retrieved because on cart from workflow sales_channel_id is missing
        const originalCart = await cartService.retrieveCart(cart.id);

        if (addresses.length > 0) {
            const address = addresses[0];
            const updateCartWorkflowInputDTO: UpdateCartWorkflowInputDTO = {
                id: cart.id,
                shipping_address: {
                    city: address.city,
                    address_1: address.address_1,
                    address_2: address.address_2,
                    company: address.company,
                    customer_id: address.customer_id,
                    country_code: address.country_code,
                    first_name: address.first_name,
                    last_name: address.last_name,
                    phone: address.phone,
                    province: address.province,
                    postal_code: address.postal_code,
                    metadata: address.metadata,
                },
            };
            await updateCartWorkflow(container).run({ input: updateCartWorkflowInputDTO });
        }
    }
});
