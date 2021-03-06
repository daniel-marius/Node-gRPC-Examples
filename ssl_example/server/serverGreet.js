const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 50051;

const fs = require("fs");
const path = require("path");
const grpc = require("grpc");

const { configProto } = require("../utils/configProto");
const { sleep } = require("../utils/functions");

// Get full path: parent directory path + file location
const CERTS_PATH = path.join(__dirname, "../certs/");

class ServerGreet {
  #protoDef;
  #greetPackageDefinition;
  #server;

  constructor() {
    const unsafeCredentials = grpc.ServerCredentials.createInsecure();

    let certs = {};

    try {
      certs = {
        certCA: fs.readFileSync(path.resolve(CERTS_PATH + "ca.crt")),
        serverKey: fs.readFileSync(path.resolve(CERTS_PATH + "server.key")),
        serverCert: fs.readFileSync(path.resolve(CERTS_PATH + "server.crt"))
      };
    } catch (e) {
      console.log("Error: ", e.stack);
    }

    const secureCredentials = grpc.ServerCredentials.createSsl(
      certs.certCA,
      [
        {
          private_key: certs.serverKey,
          cert_chain: certs.serverCert
        }
      ],
      true
    );

    this.#protoDef = configProto("..", "/protos/", "greet.proto");
    this.#greetPackageDefinition = grpc.loadPackageDefinition(
      this.#protoDef
    ).greet;
    this.#server = new grpc.Server();

    this.#server.addService(this.#greetPackageDefinition.GreetService.service, {
      greet: this.greet,
      greetManyTimes: this.greetManyTimes,
      longGreet: this.longGreet,
      greetEveryone: this.greetEveryone
    });

    // this.#server.bindAsync(`${HOST}:${PORT}`, secureCredentials, err => {
    //   if (err) {
    //     console.error(err);
    //   }
    //
    //   this.#server.start();
    //   console.log(`GRPC Server running on: ${HOST} and port: ${PORT}`);
    // });

    this.#server.bind(`${HOST}:${PORT}`, secureCredentials);
    this.#server.start();
    console.log(`GRPC Server running on: ${HOST} and port: ${PORT}`);
  }

  // Unary API
  greet(call, callback) {
    const { first_name, last_name } = call.request.greeting;
    const result = "Hello from Server: " + first_name + " " + last_name;
    callback(null, { result });
  }

  // Server Streaming API
  greetManyTimes(call, callback) {
    const { first_name, last_name } = call.request.greeting;

    let count = 0,
      intervalID = setInterval(() => {
        const result = "Hello " + first_name + " " + last_name;
        console.log("Server sending...");
        call.write({ result });
        if (++count > 9) {
          clearInterval(intervalID);
          call.end();
        }
      }, 1000);
  }

  // Client Streaming API
  longGreet(call, callback) {
    call.on("data", request => {
      const { first_name, last_name } = request.greeting;
      const result = first_name + " " + last_name;
      console.log("Received from Client: " + result);
    });

    call.on("error", error => console.log(error));

    call.on("end", () => {
      const result = "Client streaming ending...";
      callback(null, { result });
    });
  }

  // Bidirectional Streaming API
  async greetEveryone(call, callback) {
    call.on("data", request => {
      const { first_name, last_name } = request.greeting;
      const result = first_name + " " + last_name;
      console.log("Received from Client: " + result);
    });

    call.on("error", error => console.log(error));

    for (let i = 0; i < 10; i++) {
      const first_name = "name1";
      const last_name = "name2";
      const result = "Hello " + first_name + " " + last_name;
      console.log("Sending to client: " + result);
      call.write({ result });
      try {
        await sleep(1500);
      } catch (error) {
        console.log(error);
      }
    }
    call.end();
  }
}

const obj = new ServerGreet();
