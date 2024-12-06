import { defineLink } from "@medusajs/framework/utils";
import AdvancedProductPriceModule from "../modules/advanced-product-price";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(ProductModule.linkable.product, AdvancedProductPriceModule.linkable.advancedProductPrice);
