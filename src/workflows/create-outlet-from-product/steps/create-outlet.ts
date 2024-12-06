import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import OutletModuleService from "../../../modules/outlet/service";
import { OUTLET_MODULE } from "../../../modules/outlet";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";

type CreateOutletStepInput = {
    is_outlet?: boolean;
};

export const createOutletStep = createStep(
    "create-outlet",
    async function (data: CreateOutletStepInput, { container }) {
        const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
        if (!data || data.is_outlet === undefined) {
            return;
        }

        const outletModuleService: OutletModuleService = container.resolve(OUTLET_MODULE);
        const outlet = await outletModuleService.createOutlets(data);
        logger.debug("Outlet created");
        return new StepResponse(outlet, outlet);
    },
    async function (outlet, { container }) {
        const outletModuleService: OutletModuleService = container.resolve(OUTLET_MODULE);

        await outletModuleService.deleteOutlets(outlet.id);
    },
);
