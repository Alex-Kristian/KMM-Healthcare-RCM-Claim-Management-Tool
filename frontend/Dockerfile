FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

ENV PORT=5173
EXPOSE $PORT

CMD sh -c "npm run preview -- --host 0.0.0.0 --port $PORT"