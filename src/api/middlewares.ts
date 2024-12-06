import { authenticate, defineMiddlewares } from "@medusajs/medusa";
import { z } from "zod";
import { validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import { StoreGetCartsCart } from "@medusajs/medusa/api/store/carts/validators";
import { CustomStoreAddCartLineItem } from "./store/carts/validators";
import { retrieveTransformQueryConfig } from "@medusajs/medusa/api/store/carts/query-config";

export default defineMiddlewares({
    routes: [
        {
            method: "POST",
            matcher: "/admin/products",
            additionalDataValidator: {
                is_outlet: z.boolean().optional(),
            },
        },
        {
            matcher: "/store/carts/current",
            method: "ALL",
            middlewares: [authenticate("customer", ["session", "bearer"])],
        },
        {
            method: "POST",
            matcher: "/store/carts/:id",
            additionalDataValidator: {
                shipping_address_id: z.string().nullish(),
            },
        },
        {
            method: ["POST"],
            matcher: "/store/carts/:id/line-items",
            middlewares: [
                validateAndTransformBody(CustomStoreAddCartLineItem),
                validateAndTransformQuery(StoreGetCartsCart, retrieveTransformQueryConfig),
            ],
        },
    ],
});
