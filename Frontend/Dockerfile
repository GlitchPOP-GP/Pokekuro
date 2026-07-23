FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "lan"]