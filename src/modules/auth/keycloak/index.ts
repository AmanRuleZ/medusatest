import { ModuleProvider } from "@medusajs/utils";
import KeycloakAuthService from "./keycloak-auth-service";
import { Modules } from "@medusajs/framework/utils";

export default ModuleProvider(Modules.AUTH, {
    services: [KeycloakAuthService],
});
