FROM node:8 as build
WORKDIR /app
COPY package.json ./
RUN mkdir /src
COPY src/main.js ./src/
RUN npm install

FROM node:8-alpine
COPY --from=build /app /
EXPOSE 8000
CMD ["npm", "start"]