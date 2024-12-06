import { defineLink } from "@medusajs/framework/utils";
import OutletModule from "../modules/outlet";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(ProductModule.linkable.product, OutletModule.linkable.outlet);
