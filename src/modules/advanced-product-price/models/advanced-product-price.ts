import { model } from "@medusajs/framework/utils";

export const AdvancedProductPrice = model.define("advanced_product_price", {
    id: model.id().primaryKey(),
    listPrice: model.bigNumber(),
    msrp: model.bigNumber(),
    msp: model.bigNumber()
});

export default AdvancedProductPrice;
