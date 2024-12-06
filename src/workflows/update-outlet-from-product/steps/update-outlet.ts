import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { OUTLET_MODULE } from "../../../modules/outlet";
import OutletModuleService from "../../../modules/outlet/service";
import { Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

type UpdateOutletStepInput = {
    id: string;
    is_outlet: boolean;
};

export const updateOutletStep = createStep(
    "update-outlet",
    async ({ id, is_outlet }: UpdateOutletStepInput, { container }) => {
        const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        const outletModuleService: OutletModuleService = container.resolve(OUTLET_MODULE);

        const prevData = await outletModuleService.retrieveOutlet(id);

        const outlet = await outletModuleService.updateOutlets({
            id,
            is_outlet,
        });
        logger.debug("Outlet updated");
        return new StepResponse(outlet, prevData);
    },
    async (prevData, { container }) => {
        const outletModuleService: OutletModuleService = container.resolve(OUTLET_MODULE);

        await outletModuleService.updateOutlets(prevData);
    },
);
