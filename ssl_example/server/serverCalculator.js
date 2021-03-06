const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 50051;

const grpc = require("grpc");

const { configProto } = require("../utils/configProto");
const { sleep } = require("../utils/functions");

class ServerCalculator {
  #protoDef;
  #calcPackageDefinition;
  #server;

  constructor() {
    const unsafeCredentials = grpc.ServerCredentials.createInsecure();

    this.#protoDef = configProto("..", "/protos/", "calculator.proto");
    this.#calcPackageDefinition = grpc.loadPackageDefinition(
      this.#protoDef
    ).calculator;
    this.#server = new grpc.Server();

    this.#server.addService(
      this.#calcPackageDefinition.CalculatorService.service,
      {
        sum: this.sum,
        primeNumberDecomposition: this.primeNumberDecomposition,
        computeAverage: this.computeAverage,
        findMaximum: this.findMaximum,
        squareRoot: this.squareRoot
      }
    );

    this.#server.bind(`${HOST}:${PORT}`, unsafeCredentials);
    this.#server.start();

    console.log(`GRPC Server running on: ${HOST} and port: ${PORT}`);
  }

  // Unary API
  sum(call, callback) {
    const { first_number, second_number } = call.request;
    const sum_result = first_number + second_number;
    callback(null, { sum_result });
  }

  // Server Streaming API
  primeNumberDecomposition(call, callback) {
    let { number } = call.request,
      divisor = 2;

    while (number > 1) {
      if (number % divisor === 0) {
        let prime_factor = divisor;
        number /= divisor;
        console.log("Send to Client: " + prime_factor.toString());
        call.write({ prime_factor });
      } else {
        divisor += 1;
        console.log("Divisor: " + divisor);
      }
    }

    call.end();
  }

  // Client Streaming API
  computeAverage(call, callback) {
    let sum = 0,
      count = 0;

    call.on("data", request => {
      sum += request.number;
      console.log("Received from Client: " + request.number.toString());
      count += 1;
    });
    call.on("error", error => {
      console.error(error);
    });
    call.on("end", () => {
      let average = sum / count;
      average = average.toFixed(2);
      console.log("Sent to Client: " + average.toString());
      callback(null, { average });
    });
  }

  // Bidirectional Streaming API
  async findMaximum(call, callback) {
    let currentMaximum = -100000,
      currentNumber = 0;
    call.on("data", request => {
      currentNumber = request.number;
      if (currentNumber > currentMaximum) {
        currentMaximum = currentNumber;
        let maximum = currentMaximum;
        console.log("Send to Client: " + maximum.toString());
        call.write({ maximum });
      } else {
      }
      console.log("Received from Client: " + request.number.toString());
    });

    call.on("error", error => {
      console.error(error);
    });

    call.on("end", () => {
      const maximum = currentNumber;
      console.log("Send to Client: " + maximum.toString());
      call.write({ maximum });
      console.log("End!");
      call.end();
    });
  }

  // Error example
  squareRoot(call, callback) {
    const { number } = call.request;

    if (number >= 0) {
      const number_root = Math.sqrt(number);
      callback(null, { number_root });
    } else {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "The number is not positive"
      });
    }
  }
}

const obj = new ServerCalculator();
