import { MedusaService } from "@medusajs/framework/utils";
import { AdvancedProductPrice } from "./models/advanced-product-price";

class AdvancedProductPriceModuleService extends MedusaService({
    AdvancedProductPrice,
}) {
}

export default AdvancedProductPriceModuleService;
