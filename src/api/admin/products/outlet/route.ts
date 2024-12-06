import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const { fields, limit = 20, offset = 0 } = req.validatedQuery || {};
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const {
        data: outlets,
        metadata: { count, take, skip },
    } = await query.graph({
        entity: "outlet",
        fields: ["id", "is_outlet", "product.*", ...(fields || [])],
        pagination: {
            skip: offset,
            take: limit,
        },
        filters: {
            is_outlet: true,
        },
    });

    const products = outlets.flatMap((outlet) => {
        if (outlet.product) {
            return {
                ...outlet.product,
                outlet: {
                    id: outlet.id,
                    is_outlet: outlet.is_outlet,
                },
            };
        }
        return [];
    });

    res.json({
        products: products,
        count,
        limit: take,
        offset: skip,
    });
};
