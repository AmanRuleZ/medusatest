import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import AdvancedProductPriceModuleService from "../../../modules/advanced-product-price/service";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";
import {ADVANCED_PRODUCT_PRICE_MODULE} from "../../../modules/advanced-product-price";

type CreateAdvancedProductPricesStepInput = {
    listPrice?: number;
    msrp?: number;
    msp?: number;
};

export const createAdvancedProductPricesStep = createStep(
    "create-advanced-product-price",
    async function (data: CreateAdvancedProductPricesStepInput, { container }) {
        const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
        if (!data || (data.listPrice === undefined && data.msrp === undefined && data.msp === undefined)) {
            return;
        }

        const advancedProductPriceModuleService: AdvancedProductPriceModuleService = container.resolve(ADVANCED_PRODUCT_PRICE_MODULE);
        const outlet = await advancedProductPriceModuleService.createAdvancedProductPrices(data);
        logger.debug("Advanced product prices created");
        return new StepResponse(outlet, outlet);
    },
    async function (outlet, { container }) {
        const advancedProductPriceModuleService: AdvancedProductPriceModuleService = container.resolve(ADVANCED_PRODUCT_PRICE_MODULE);

        await advancedProductPriceModuleService.deleteAdvancedProductPrices(outlet.id);
    },
);
