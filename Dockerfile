FROM node:10.15.1

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

ENV HOST 0.0.0.0

EXPOSE 3003

CMD ["npm", "run", "start"]