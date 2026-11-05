# Small production image for Shelf. No dependencies to install: the app uses only Node built-ins.
FROM node:22-alpine

ENV NODE_ENV=production PORT=3000 SHELF_DATA=/data/data.json
WORKDIR /app

# Run as the unprivileged "node" user that ships with the image.
RUN mkdir -p /data && chown node:node /data
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node web ./web
USER node

VOLUME /data
EXPOSE 3000

# The platform (or `docker run --health-cmd`) can use this to decide when the container is ready.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
