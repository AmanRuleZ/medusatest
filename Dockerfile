FROM node:20.9.0-alpine
USER node
COPY --chown=node:node app /app
WORKDIR /app
COPY --chown=node:node artifacts.tar.gz artifacts.tar.gz
RUN tar -xzf /app/artifacts.tar.gz -C /app/

ENV TZ='Europe/Warsaw'

EXPOSE 9000

WORKDIR /app/.medusa/server/
CMD ["npx", "medusa", "start", "--host", "0.0.0.0", "-p", "9000"]
