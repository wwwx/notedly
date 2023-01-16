FROM node:12.3.1

# Create app directory
WORKDIR /urs/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where avilable(npm@5+)
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4000

CMD ["npm", "start"]



