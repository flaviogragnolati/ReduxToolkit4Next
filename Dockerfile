# pull base img node (node v16.13.0 & Debian 11.1)
FROM node:16-bullseye as base
LABEL MANTAINER="<flavio.gragnolati@gmail.com>"

EXPOSE ${PORT}

#  creates & sets working directory
RUN mdkir -R /usr/src/app && chown node:node /usr/src/app
WORKDIR /usr/src/app

# set env variables
# ENV NODE_ENV=production
ENV NODE_ENV ${STAGE}

# Change to non root user
USER node

# install all the dependencies
# Copy package.json and lock files before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY --chown=node:node package.json package-lock*.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
# RUN npm install --production && npm cache clean --force // if using npm

# copy new files to working
COPY --chown=node:node . /usr/src/app/

# Install PM2 globally
# RUN npm install --global pm2 // if using pm2

# Rebuild the source code only when needed
FROM base as builder
WORKDIR /usr/src/app
COPY . .
COPY --from=base /usr/src/app/node_modules ./node_modules
RUN yarn build
# RUN npm run build // if using npm

# Production image, copy all the files and run next
FROM base as runner
WORKDIR /usr/src/app

# copy files
COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# run
CMD ["node", "index.js"]
# CMD ["yarn", "start"] // Start with yarn
# CMD ["npm", "start"] // Start with npm
# CMD [ "pm2-runtime", "npm", "--", "start" ] //Start with pm2