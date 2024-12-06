import AdvancedProductPriceModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const ADVANCED_PRODUCT_PRICE_MODULE = "advancedProductPriceModuleService";

export default Module(ADVANCED_PRODUCT_PRICE_MODULE, {
    service: AdvancedProductPriceModuleService,
});
