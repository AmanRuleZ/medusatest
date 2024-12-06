import { model } from "@medusajs/framework/utils";

export const Outlet = model.define("outlet", {
    id: model.id().primaryKey(),
    is_outlet: model.boolean(),
});

export default Outlet;
