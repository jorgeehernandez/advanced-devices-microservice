FROM keymetrics/pm2:latest-alpine

WORKDIR /app

# Bundle APP files
COPY package.json /app
RUN npm install --production
COPY . /app

EXPOSE 80

CMD [ "pm2-runtime", "start", "pm2.json" ]
