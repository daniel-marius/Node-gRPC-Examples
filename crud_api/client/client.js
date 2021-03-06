const path = require("path");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "../proto/customers.proto");
// docker bridge ipv4 address
// const HOST = "172.17.0.1";

// ipv4 address of the grpc server running inside docker container
const HOST = "172.18.0.2"; 
const PORT = 30043;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true
});

const CustomerService = grpc.loadPackageDefinition(packageDefinition)
  .CustomerService;
const client = new CustomerService(
  `${HOST}:${PORT}`,
  grpc.credentials.createInsecure()
);

module.exports = client;
