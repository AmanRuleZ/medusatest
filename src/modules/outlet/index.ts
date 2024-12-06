import OutletModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const OUTLET_MODULE = "outletModuleService";

export default Module(OUTLET_MODULE, {
    service: OutletModuleService,
});
