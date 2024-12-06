import { AbstractAuthModuleProvider, MedusaError } from "@medusajs/utils";
import {
    AuthenticationInput,
    AuthenticationResponse,
    AuthIdentityProviderService,
    CreateCustomerDTO,
} from "@medusajs/types";
import { KeycloakProviderOptions } from "./keycloak-provider-options";
import { Logger } from "@medusajs/framework/types";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createCustomerAccountWorkflow, CreateCustomerAccountWorkflowInput } from "@medusajs/core-flows";

type InjectedDependencies = {
    logger: Logger;
};

interface CustomerDTO extends CreateCustomerDTO {
    [key: string]: unknown;
}

class KeycloakAuthService extends AbstractAuthModuleProvider {
    static identifier = "keycloak";
    static DISPLAY_NAME = "Keycloak Authentication";
    static GRANT_TYPE = "authorization_code";

    protected logger_: Logger;
    protected config_: KeycloakProviderOptions;
    protected baseKeycloakUrl_: string;
    protected callbackUrl_: string;

    static validateOptions(config_: KeycloakProviderOptions) {
        if (!config_.baseUrl) {
            throw new Error("Keycloak baseUrl is required");
        }
        if (!config_.realm) {
            throw new Error("Keycloak realm is required");
        }
        if (!config_.clientId) {
            throw new Error("Keycloak clientId is required");
        }
        if (!config_.clientSecret) {
            throw new Error("Keycloak clientSecret is required");
        }
        if (!config_.medusaBaseUrl) {
            throw new Error("Keycloak medusaBaseUrl is required");
        }
    }

    constructor({ logger }: InjectedDependencies, options: KeycloakProviderOptions) {
        // @ts-ignore
        super(...arguments);
        this.logger_ = logger;
        this.config_ = options;

        this.baseKeycloakUrl_ = `${this.config_.baseUrl}/auth/realms/${this.config_.realm}/protocol/openid-connect`;
        this.callbackUrl_ = `${this.config_.medusaBaseUrl}/auth/customer/keycloak/callback`;
    }

    async register(_): Promise<AuthenticationResponse> {
        throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "Keycloak does not support registration. Use method `authenticate` instead.",
        );
    }

    async authenticate(
        req: AuthenticationInput,
        authIdentityProviderService: AuthIdentityProviderService,
    ): Promise<AuthenticationResponse> {
        if (req.query?.error) {
            return {
                success: false,
                error: `${req.query.error_description}, read more at: ${req.query.error_uri}`,
            };
        }
        return this.getRedirect(this.config_);
    }

    async validateCallback(
        req: AuthenticationInput,
        authIdentityService: AuthIdentityProviderService,
    ): Promise<AuthenticationResponse> {
        if (req.query && req.query.error) {
            return {
                success: false,
                error: `${req.query.error_description}, read more at: ${req.query.error_uri}`,
            };
        }
        const { clientId } = this.config_;
        const code = req.query.code;

        const params = new URLSearchParams({
            grant_type: KeycloakAuthService.GRANT_TYPE,
            client_id: clientId,
            redirect_uri: this.callbackUrl_,
            code: code as string,
        });

        const tokenUrl = new URL(`${this.baseKeycloakUrl_}/token`);

        try {
            const response = await axios({
                method: "post",
                url: tokenUrl.toString(),
                data: params.toString(),
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then((res) => {
                if (res.status !== StatusCodes.OK) {
                    throw new MedusaError(
                        MedusaError.Types.INVALID_DATA,
                        `Could not exchange token, ${res.status}, ${res.statusText}`,
                    );
                }
                return res;
            });

            const accessToken = response?.data?.id_token;
            const expiresIn = response?.data?.expiresIn;
            const refreshToken = response?.data?.refresh_token;
            const refreshExpiresIn = response?.data?.refresh_expires_in;
            const { authIdentity, success } = await this.verify_(
                accessToken,
                refreshToken,
                expiresIn,
                refreshExpiresIn,
                authIdentityService,
            );

            return {
                success,
                authIdentity,
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async verify_(
        accessToken: string | undefined,
        refreshToken: string | undefined,
        expiresIn: string | undefined,
        refreshExpiresIn: string | undefined,
        authIdentityService: AuthIdentityProviderService,
    ) {
        if (!accessToken) {
            return { success: false, error: "No token found" };
        }

        const jwtData = jwt.decode(accessToken, {
            complete: true,
        }) as JwtPayload;
        const payload = jwtData.payload;

        if (!payload.email_verified) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Email not verified, cannot proceed with authentication",
            );
        }

        const entityId = payload.sub;
        const userMetadata: CustomerDTO = {
            email: payload.email,
            first_name: payload.given_name,
            last_name: payload.family_name,
            company_name: this.findCompanyName(payload),
        };

        const providerMetadata = {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_at: expiresIn,
            refresh_token_expires_at: refreshExpiresIn,
        };

        let authIdentity;
        try {
            authIdentity = await authIdentityService.update(entityId, {
                user_metadata: userMetadata,
                provider_metadata: providerMetadata,
            });
        } catch (error) {
            if (error.type === MedusaError.Types.NOT_FOUND) {
                authIdentity = await authIdentityService.create({
                    entity_id: entityId,
                    user_metadata: userMetadata,
                    provider_metadata: providerMetadata,
                });
            } else {
                return { success: false, error: error.message };
            }
        }

        if (!authIdentity?.app_metadata?.customer_id) {
            const input: CreateCustomerAccountWorkflowInput = {
                authIdentityId: authIdentity.id,
                customerData: userMetadata,
            };
            const createCustomerWorkflow = createCustomerAccountWorkflow();
            await createCustomerWorkflow.run({ input });
            authIdentity = await authIdentityService.retrieve({
                entity_id: entityId,
            });
        }

        return {
            success: true,
            authIdentity,
        };
    }

    private getRedirect({ clientId }: KeycloakProviderOptions) {
        const scope = "openid email profile";
        const response_type = "code";

        const params = new URLSearchParams({
            client_id: clientId,
            scope: scope,
            response_type: response_type,
            redirect_uri: this.callbackUrl_,
        });
        const authUrl = new URL(`${this.baseKeycloakUrl_}/auth`);
        authUrl.search = params.toString();

        return { success: true, location: authUrl.toString() };
    }

    private findCompanyName(jwtPayload) {
        if (jwtPayload.current_org) {
            return jwtPayload?.orgs[jwtPayload.current_org]?.name;
        }
        return undefined;
    }
}

export default KeycloakAuthService;
