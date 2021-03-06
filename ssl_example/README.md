## Node.js gRPC Docker SSL Example

## Features

- gRPC greet service
- gRPC calculator service
- SSL certificates
- Docker containers

## Available Scripts

In the project directory, you can run:

**Install dependencies**

```bash
npm install
```

**Generate SSL Certificates (certificates will be generated at ./certs)**

```bash
npm run gen:certs
```

**Starts the grpc client**

```bash
npm run start:client
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
