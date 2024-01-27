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
COPY ../client .
# expose client port
EXPOSE 5173

# Set the default command to run when the container starts
ENTRYPOINT [ "npm"]