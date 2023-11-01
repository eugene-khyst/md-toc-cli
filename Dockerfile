FROM node:18-alpine

WORKDIR /md-toc-cli
COPY package*.json ./
RUN npm pkg delete scripts.prepare && \
    npm ci --omit=dev
COPY . .
ENV NODE_ENV=production

WORKDIR /markdown

ENTRYPOINT ["node", "/md-toc-cli/src/bin/index.js"]