exports.getRPCDeadline = rpcType => {
  let timeAllowed = 5000;

  switch (rpcType) {
    case 1:
      timeAllowed = 1000;
      break;
    case 2:
      timeAllowed = 7000;
      break;

    default:
      console.log("Invalid RPC Type!");
  }

  return new Date(Date.now() + timeAllowed);
};

exports.sleep = async interval => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
};
