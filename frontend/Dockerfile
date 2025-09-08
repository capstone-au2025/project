FROM node:24

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . /app

RUN sed -i 's/localhost:3001/backend:3001/g' vite.config.ts

CMD ["npm", "run", "dev", "--", "--host"]
