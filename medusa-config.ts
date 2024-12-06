import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'local', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseSchema: process.env.DATABASE_SCHEMA,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "./src/modules/auth/keycloak",
            id: "keycloak",
            options: {
              baseUrl: process.env.KEYCLOAK_BASE_URL,
              realm: process.env.KEYCLOAK_REALM,
              clientId: process.env.KEYCLOAK_CLIENT_ID,
              clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
              medusaBaseUrl: process.env.MEDUSA_BACKEND_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
        ],
      },
    },
    {
      resolve: "./src/modules/outlet",
    },
    {
      resolve: "./src/modules/advanced-product-price",
    }
  ]
})
