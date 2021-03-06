const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 50051;

const grpc = require("grpc");

const { configProto } = require("../utils/configProto");
const { getRPCDeadline, sleep } = require("../utils/functions");

class ClientCalculator {
  #protoDef;
  #CalcPackageDefinition;
  #client;

  constructor() {
    const unsafeCredentials = grpc.credentials.createInsecure();

    this.#protoDef = configProto("..", "/protos/", "calculator.proto");
    this.#CalcPackageDefinition = grpc.loadPackageDefinition(
      this.#protoDef
    ).calculator;
    this.#client = new this.#CalcPackageDefinition.CalculatorService(
      `${HOST}:${PORT}`,
      unsafeCredentials
    );

    console.log(`GRPC Client running on: ${HOST} and port: ${PORT}`);
  }

  // Unary API
  callSum() {
    const request = {
      first_number: 23,
      second_number: 34
    };

    this.#client.sum(request, (error, response) => {
      if (!error) {
        console.log("Sum Response: " + response.sum_result.toString());
      } else {
        console.error(error);
      }
    });
  }

  // Server Streaming API
  callPrimeNumberDecomposition() {
    const request = {
      number: 15
    };

    const call = this.#client.primeNumberDecomposition(request, () => {});

    call.on("data", response => {
      console.log("Response from Server: " + response.prime_factor.toString());
    });

    call.on("error", error => {
      console.error(error);
    });

    call.on("status", status => {
      console.log("End!");
    });
  }

  // Client Streaming API
  callComputeAverage() {
    const call = this.#client.computeAverage((error, response) => {
      if (!error) {
        console.log(
          "Response from Server: " + response.average.toFixed(2).toString()
        );
      } else {
        console.error(error);
      }
    });

    for (let i = 0; i < 1000; i++) {
      const request = {
        number: i
      };
      console.log("Sending to server: " + i.toString());
      call.write(request);
    }

    call.end();
  }

  // Bidirectional Streaming API
  async callBiDiFindMaximum() {
    const call = this.#client.findMaximum((error, response) => {
      if (!error) {
        console.log("Response from Server: " + response.maximum.toString());
      } else {
        console.log(error);
      }
    });

    call.on("data", response => {
      console.log("Response from Server: " + response.maximum.toString());
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

    const data = [3, 4, 5, 7];
    for (let i = 0; i < data.length; i++) {
      const request = {
        number: data[i]
      };
      console.log("Sending Number to Server: " + data[i].toString());
      call.write(request);
      await sleep(1000);
    }

    call.end();
  }

  // Error example
  doErrorCall() {
    const deadline = getRPCDeadline(2);
    const number = -1;
    const squareRootRequest = {
      number
    };

    this.#client.squareRoot(
      squareRootRequest,
      { deadline },
      (error, response) => {
        if (!error) {
          console.log(
            "Response from Server: " + response.number_root.toString()
          );
        } else {
          console.error(error.message);
        }
      }
    );
  }
}

const obj = new ClientCalculator();

obj.callSum();
obj.callPrimeNumberDecomposition();
obj.callComputeAverage();
obj.callBiDiFindMaximum();
obj.doErrorCall();
