import { CartDTO, ICartModuleService } from "@medusajs/types";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

type StepInput = {
    cart: CartDTO;
};

const deleteCartStep = createStep("delete-cart", async ({ cart }: StepInput, { container }) => {
    const cartService: ICartModuleService = container.resolve(Modules.CART);

    await cartService.deleteCarts(cart.id);

    return new StepResponse({
        success: true,
    });
});

export default deleteCartStep;
