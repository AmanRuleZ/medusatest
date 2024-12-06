import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {ADVANCED_PRODUCT_PRICE_MODULE} from "../../../modules/advanced-product-price";
import AdvancedProductPriceModuleService from "../../../modules/advanced-product-price/service";

type UpdateAdvancedProductPriceStepInput = {
    id: string;
    listPrice: number;
    msrp: number;
    msp: number;
};

export const updateAdvancedProductPriceStep = createStep(
    "update-advanced-product-price",
    async ({ id, listPrice, msrp, msp }: UpdateAdvancedProductPriceStepInput, { container }) => {
        const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        const advancedProductPriceModuleService: AdvancedProductPriceModuleService = container.resolve(ADVANCED_PRODUCT_PRICE_MODULE);

        const prevData = await advancedProductPriceModuleService.retrieveAdvancedProductPrice(id);

        const app = await advancedProductPriceModuleService.updateAdvancedProductPrices({id, listPrice, msrp, msp});
        logger.debug("Outlet updated");
        return new StepResponse(app, prevData);
    },
    async (prevData, { container }) => {
        const advancedProductPriceModuleService: AdvancedProductPriceModuleService = container.resolve(ADVANCED_PRODUCT_PRICE_MODULE);

        await advancedProductPriceModuleService.updateAdvancedProductPrices(prevData);
    },
);
