import { MedusaService } from "@medusajs/framework/utils";
import { Outlet } from "./models/outlet"; // Adjust the import path as needed

class OutletModuleService extends MedusaService({
    Outlet,
}) {
    // You can add custom methods here if needed
}

export default OutletModuleService;
