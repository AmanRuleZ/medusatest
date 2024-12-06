import { z } from "zod";

export type CustomStoreAddCartLineItemType = z.infer<typeof CustomStoreAddCartLineItem>;
export const CustomStoreAddCartLineItem = z.object({
    variant_id: z.string(),
    quantity: z.number(),
    sku: z.string(),
});
