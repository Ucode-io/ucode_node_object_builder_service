FROM surnet/alpine-wkhtmltopdf:3.16.2-0.12.6-full as wkhtmltopdf
FROM node:19.4-alpine3.17 
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

RUN apk add --no-cache \
        libstdc++ \
        libx11 \
        libxrender \
        libxext \
        libssl1.1 \
        ca-certificates \
        fontconfig \
        freetype \
        ttf-droid \
        ttf-freefont \
        ttf-liberation \
        ;

RUN apk update && apk add --no-cache xvfb ttf-dejavu

COPY --from=wkhtmltopdf /bin/wkhtmltopdf /bin/libwkhtmltox.so /bin/

COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
