FROM node:20.6
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY main.js .
CMD ["node", "."]