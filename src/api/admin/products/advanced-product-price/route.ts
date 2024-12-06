import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const { fields, limit = 20, offset = 0 } = req.validatedQuery || {};
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const {
        data: advancedProductPrices,
        metadata: { count, take, skip },
    } = await query.graph({
        entity: "advanced_product_price",
        fields: ["id", "listPrice", "msrp", "msp", "product.*", ...(fields || [])],
        pagination: {
            skip: offset,
            take: limit,
        },
    });

    const products = advancedProductPrices.flatMap((prices) => {
        if (prices.product) {
            return {
                ...prices.product,
                advanced_product_price: {
                    id: prices.id,
                    listPrice: prices.listPrice,
                    msrp: prices.msrp,
                    msp: prices.msp
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
