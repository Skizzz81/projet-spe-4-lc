FROM node:22-alpine

WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node frontend/package.json ./frontend/package.json
COPY --chown=node:node api/package.json ./api/package.json
COPY --chown=node:node realtime/package.json ./realtime/package.json

USER node

RUN npm ci

COPY --chown=node:node api ./api

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "api"]

