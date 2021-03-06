## Example of CRUD made with Node.js, Express, Handlebars, gRPC, Docker and Docker-Compose

## Features

- Docker images are running using the default bridge network
- Each docker image has a different (virtual) network than the host machine has, so its loopback address is different from the host machine's loopback address
- The gRPC server connection url: 0.0.0.0:PORT (e.g. 50051) or [::]:PORT (e.g. 50051) in order to bind to other network interfaces that the client can connect to from outside of the docker container
- The gRPC client is exposed via Express server
- The gRPC client connection url: grpc_server_docker_ipv4_address:PORT, for the same reason as server binding to 0.0.0.0:PORT
- For finding the ipv4 address of the grpc server running inside docker container we can type:
```bash
sudo docker exec -it container_name cat /etc/hosts
```
- Handlebars template engine with Node.js and Express

## Available Scripts

In the project directory, you can run:

**Install dependencies**

```bash
npm install
```

**Starts the express server**
**The grpc client is exposed via the express server**

```bash
npm run start:express
```

**Starts the grpc server**

```bash
npm run start:server
```

**Both server and client start concurrently**

```bash
npm run start
```

**Running the application using docker-compose**

```bash
docker-compose up --build
```

**Shutdown docker-compose**

```bash
docker-compose down
```

**Remove all containers, networks, images**

```bash
docker system prune
```
