//   const headers = {
  //     'Content-Type': 'text/event-stream',
  //     Connection: 'keep-alive',
  //     'Cache-Control': 'no-cache',
  //   };

  //   try {
  //     res.writeHead(200, headers);

const serverSentMiddleware = (req, res, next) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  res.writeHead(200, headers);
  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Cache-Control', 'no-cache');

  // // only if you want anyone to access this endpoint
  // res.setHeader('Access-Control-Allow-Origin', '*');

  // res.flushHeaders();

  const sendEventStreamData = (data) => {
      const sseFormattedResponse = `data: ${JSON.stringify(data)}\n\n`;
      res.write(sseFormattedResponse);
  }

  // we are attaching sendEventStreamData to res, so we can use it later
  Object.assign(res, {
      sendEventStreamData
  });

  next();
}


module.exports = { serverSentMiddleware };