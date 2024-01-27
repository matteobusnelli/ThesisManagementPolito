FROM node:18-alpine

# Define the application's working directory.
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install
# copy source code and npm files
COPY ../server .

# Adjust permissions for the index.js file if needed
RUN chmod +x /usr/src/app

# expose server port
EXPOSE 3001

# Run this command when the container is started
CMD ["node", "index.js"]