FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_USER_POOL_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID


RUN npm run build


FROM node:20

WORKDIR /app


RUN npm install -g serve


COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]