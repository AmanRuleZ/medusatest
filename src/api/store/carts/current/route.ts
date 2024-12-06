import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { FilterableCartProps, ICartModuleService } from "@medusajs/types";

interface UserCartsRequest extends AuthenticatedMedusaRequest {
    query: {
        fields: string;
        relations: string;
    };
}

export const GET = async (req: UserCartsRequest, res: MedusaResponse) => {
    const cartModuleService: ICartModuleService = await req.scope.resolve(Modules.CART);
    const filters: FilterableCartProps = {
        customer_id: req.auth_context.actor_id,
    };
    const carts = await cartModuleService.listCarts(filters, {
        select: req.query.fields.split(","),
        relations: req.query.relations.split(","),
    });

    res.json({
        carts,
    });
};
