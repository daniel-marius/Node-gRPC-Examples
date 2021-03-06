const path = require("path");
const protoLoader = require("@grpc/proto-loader");

exports.configProto = (directoryPath, directoryName, fileName) => {
  const protoPath = path.join(
    __dirname,
    directoryPath,
    directoryName,
    fileName
  );
  const protoDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  return protoDefinition;
};
