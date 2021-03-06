const HOST = process.env.HOST || "example.com";
const PORT = process.env.PORT || 50051;

const fs = require("fs");
const path = require("path");
const grpc = require("grpc");

const { configProto } = require("../utils/configProto");
const { sleep } = require("../utils/functions");

// Get full path: parent directory path + file location
const CERTS_PATH = path.join(__dirname, "../certs/");

class ClientGreet {
  #protoDef;
  #GreetPackageDefinition;
  #client;

  constructor() {
    const unsafeCredentials = grpc.credentials.createInsecure();

    let certs = {};

    try {
      certs = {
        certCA: fs.readFileSync(CERTS_PATH + "ca.crt"),
        clientKey: fs.readFileSync(path.resolve(CERTS_PATH + "client.key")),
        clientCert: fs.readFileSync(path.resolve(CERTS_PATH + "client.crt"))
      };
    } catch (e) {
      console.log("Error: ", e.stack);
    }


    const secureCredentials = grpc.credentials.createSsl(
      certs.certCA,
      certs.clientKey,
      certs.clientCert
    );

    const options = {
      "grpc.ssl_target_name_override": "example.com",
      "grpc.default_authority": "example.com"
    };

    this.#protoDef = configProto("..", "/protos/", "greet.proto");
    this.#GreetPackageDefinition = grpc.loadPackageDefinition(
      this.#protoDef
    ).greet;
    this.#client = new this.#GreetPackageDefinition.GreetService(
      `${HOST}:${PORT}`,
      secureCredentials,
      options
    );

    console.log(`GRPC Client running on: ${HOST} and port: ${PORT}`);
  }

  // Unary API
  callGreetings() {
    const request = {
      greeting: {
        first_name: "ASCC",
        last_name: "RFRFE"
      }
    };

    this.#client.greet(request, (error, response) => {
      if (!error) {
        console.log("Greeting Response: " + response.result);
      } else {
        console.error(error);
      }
    });
  }

  // Server Streaming API
  callGreetManyTimes() {
    const request = {
      greeting: {
        first_name: "name1",
        last_name: "name2"
      }
    };

    const call = this.#client.greetManyTimes(request, () => {});

    call.on("data", response => {
      console.log("Response from Server: " + response.result);
    });

    call.on("status", status => {
      console.log(status);
    });
    call.on("error", error => {
      console.error(error);
    });
    call.on("end", () => {
      console.log("End!");
    });
  }

  // Client Streaming API
  callLongGreeting() {
    const call = this.#client.longGreet((error, response) => {
      if (!error) {
        console.log("Response from Server: " + response.result);
      } else {
        console.error(error);
      }
    });

    // for (let i = 0; i < 3; i++) {
    //   console.log('Sending Message: ' + i);
    //   const request = {
    //     greeting: {
    //       first_name: 'name1',
    //       last_name: 'name2'
    //     }
    //   };
    //   call.write(request);
    // }
    //
    // call.end();

    let count = 0,
      intervalID = setInterval(() => {
        const request = {
          greeting: {
            first_name: "name1",
            last_name: "name2"
          }
        };

        console.log("Sending Message: " + JSON.stringify(request));
        console.log("Message Number: " + count);

        call.write(request);

        if (++count > 3) {
          clearInterval(intervalID);
          call.end();
        }
      }, 1000);
  }

  // Bidirectional Streaming API
  async callGreetEveryone() {
    const call = this.#client.greetEveryone((error, response) => {
      if (!error) {
        console.log("Response from Server: " + response.result);
      } else {
        console.log(error);
      }
    });

    call.on("data", response => {
      console.log("Response from Server: " + response.result);
    });
    call.on("status", status => {
      console.log(status);
    });
    call.on("error", error => {
      console.error(error);
    });
    call.on("end", () => {
      console.log("End!");
    });

    for (let i = 0; i < 10; i++) {
      const request = {
        greeting: {
          first_name: "name1",
          last_name: "name2"
        }
      };

      console.log("Sending Message: " + JSON.stringify(request));
      call.write(request);

      try {
        await sleep(1500);
      } catch (error) {
        console.log(error);
      }
    }

    call.end();
  }
}

const obj = new ClientGreet();

obj.callGreetings();
obj.callGreetManyTimes();
obj.callLongGreeting();
obj.callGreetEveryone();
