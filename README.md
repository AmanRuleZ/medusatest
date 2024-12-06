# Medusa

## Requirements
- node.js > v20.x   
- PostgreSQL

## Running it locally
1. Clone repo
2. Create and specify local environment variables in .env file based on .env.test
3. Run `npm install`
4. Run `npx medusa db:setup --db <name>` - it creates a database for the medusa application with the specified name, if it doesn't exist.
5. Run `npm run dev:local` (run with .env variables) or `npm run dev:test` (run with .env.test variables) 

## Building 
1. Run `npm run build:test` - builds medusa server to ./medusa/server directory.
   Use one of following depending on environment:
    - build:test - copies .env.test variables to server directory
    - build:staging - copies .env.staging variables to server directory
    - build:production - copies .env.production variables to server directory
3. Run `npx medusa db:setup --db <name>` - it creates a database for the medusa application with the specified name, if it doesn't exist.
2. Run `npm run start` - starts application
