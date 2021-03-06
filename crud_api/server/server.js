const path = require("path");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");

const PROTO_PATH = path.join(__dirname, "../proto/customers.proto");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 30043;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true
});

const customersProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

const customers = [
  {
    id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
    name: "John Bolton",
    age: 23,
    address: "Address 1"
  },
  {
    id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
    name: "Mary Anne",
    age: 45,
    address: "Address 2"
  }
];

server.addService(customersProto.CustomerService.service, {
  getAll: (_, callback) => {
    callback(null, { customers });
  },

  get: (call, callback) => {
    let customer = customers.find(n => n.id === call.request.id);

    if (!customer) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found!"
      });
    }

    callback(null, customer);
  },

  insert: (call, callback) => {
    let customer = call.request;

    customer.id = uuidv4();
    customers.push(customer);
    callback(null, customer);
  },

  update: (call, callback) => {
    let existingCustomer = customers.find(n => n.id === call.request.id);

    if (!existingCustomer) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found!"
      });
    }

    existingCustomer.name = call.request.name;
    existingCustomer.age = call.request.age;
    existingCustomer.address = call.request.address;
    callback(null, existingCustomer);
  },

  remove: (call, callback) => {
    let existingCustomerIndex = customers.findIndex(n => n.id === call.request.id);

    if (existingCustomerIndex === -1) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found!"
      });
    }

    customers.splice(existingCustomerIndex, 1);
    callback(null, {});
  }
});

server.bind(`${HOST}:${PORT}`, grpc.ServerCredentials.createInsecure());
console.log(`gRPC server running at http://${HOST}:${PORT}`);
server.start();
