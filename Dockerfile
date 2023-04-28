
FROM node:19.4-alpine3.14 
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install


RUN apk update && apk add --no-cache wkhtmltopdf xvfb ttf-dejavu

RUN ln -s /usr/bin/wkhtmltopdf /usr/local/bin/wkhtmltopdf;
RUN chmod +x /usr/local/bin/wkhtmltopdf;

COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
