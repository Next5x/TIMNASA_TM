# Tunatumia toleo thabiti la Node.js
FROM node:lts-buster

# Sakinisha vifurushi vya mfumo vinavyohitajika na Zokou (ffmpeg, imagemagick, nk.)
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp \
  git \
  && apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Tengeneza folder la kazi ndani ya container
WORKDIR /root/zokou

# Nakili package.json kwanza ili kuharakisha ufungaji wa 'dependencies'
COPY package.json .

# Sakinisha maktaba za Node.js
RUN npm install

# Nakili mafaili yote ya bot yako kuingia ndani ya container
COPY . .

# Amri ya kuwasha bot
CMD ["node", "index.js"]
