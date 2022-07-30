const express = require('express');
const router = express.Router();
const { getAllMessages, updateMessage, getMessage, resendMessage, deleteMessage } = require("../controllers/tableController.js");


const useServerSentEventsMiddleware = (req, res, next) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // only if you want anyone to access this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.flushHeaders();

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

const streamRandomNumbers = (req, res) => {
  // We are sending anyone who connects to /stream-random-numbers
  // a random number that's encapsulated in an object
  let interval = setInterval(function generateAndSendRandomNumber(){
      const data = {
          value: Math.random(),
      };

      res.sendEventStreamData(data);
  }, 3000);

  // close
  res.on('close', () => {
      clearInterval(interval);
      res.end();
  });
}

router.get('/sse', useServerSentEventsMiddleware, streamRandomNumbers)



// const { serverSentMiddleware } = require("../middleware/serverSentMiddleware.js")



// const streamRandomNumbers = (req, res) => {
//   // We are sending anyone who connects to /stream-random-numbers
//   // a random number that's encapsulated in an object
//   let interval = setInterval(function generateAndSendRandomNumber(){
//       const data = {
//           value: Math.random(),
//       };

//       res.sendEventStreamData(data);
//   }, 3000);

//   // close
//   res.on('close', () => {
//       clearInterval(interval);
//       res.end();
//   });
// }

// const serverSentMiddleware = (req, res, next) => {
//   const headers = {
//     'Content-Type': 'text/event-stream',
//     'Connection': 'keep-alive',
//     'Cache-Control': 'no-cache',
//   };

//   // if (!res.headersSent) {
//     res.writeHead(200, headers);
//   // }

//   // res.setHeader('Content-Type', 'text/event-stream');
//   // res.setHeader('Cache-Control', 'no-cache');

//   // // only if you want anyone to access this endpoint
//   // res.setHeader('Access-Control-Allow-Origin', '*');

//   // res.flushHeaders();

//   const sendEventStreamData = (data) => {
//       const sseFormattedResponse = `data: ${JSON.stringify(data)}\n\n`;
//       res.write(sseFormattedResponse);
//   }

//   // we are attaching sendEventStreamData to res, so we can use it later
//   Object.assign(res, {
//       sendEventStreamData
//   });

//   next();
// }

// router.use(serverSentMiddleware());

// router.get('/sse', serverSentMiddleware, streamRandomNumbers);


  // router.get('/sse', async (req, res) => {
  //   const headers = {
  //     'Content-Type': 'text/event-stream',
  //     Connection: 'keep-alive',
  //     'Cache-Control': 'no-cache',
  //   };

  //   try {
  //     res.writeHead(200, headers);
  //     setInterval(async() => {
  //       let messages = await getAllMessages();
  //       let stringifiedMessages = JSON.stringify(messages);
  //       res.write(`data: ${stringifiedMessages}`);
  //       res.write('\n\n');
  //     }, 10000);
  //   } catch (err) {
  //     res.json({ "error": "error getting count of messages" });
  //   }

  // });

router.get('/allMessages', async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json(messages)
  } catch (err) {
    res.json({ "error": "error getting all messages" });
  }
});

// router.get('/sse', async (req, res) => {
//   const headers = {
//     'Content-Type': 'text/event-stream',
//     Connection: 'keep-alive',
//     'Cache-Control': 'no-cache',
//   };

//   try {
//     // res.writeHead(200, headers);
//     // setInterval(async() => {
//     //   let messages = await getAllMessages();
//     //   let stringifiedMessages = JSON.stringify(messages);
//     //   res.write(`data: ${stringifiedMessages}`);
//     //   res.write('\n\n');
//     // }, 10000);

//     // res.writeHead(200, headers);
//     // res.write(`data: hello from server`);
//     // res.write('\n\n');
//     // client.stream = res; // store response obj to be written to later
//     res.writeHead(200, headers);
//     let messages = await getAllMessages();
//     let stringifiedMessages = JSON.stringify(messages);
//     res.write(`data: ${stringifiedMessages}`);
//     res.write('\n\n');
//   } catch (err) {
//     res.json({ "error": "error getting count of messages" });
//   }

// });

router.put('/updateMessage/:id', async (req, res) => {
  const id = req.params.id;
  const message = req.body;

  try {
    const updated = await updateMessage(id, message);
    res.json(updated);
    res.redirect('/sse')
  } catch (err) {
    res.json({ "error": "error updating the messages" });
  }
});

router.post('/resendMessage', async (req, res) => {
  const id = req.body.id;

  try {
    const message = await getMessage(id);
    await resendMessage(message);
    await deleteMessage(id);
    res.json({ "Success": "resent message" });
  } catch (err) {
    console.log('Error:', err)
    res.json({ "error": "failed to resend message" });
  }
});

router.post('/resendAllMessages', async (req, res) => {
  try {
    const messages = await getAllMessages();
    for (let idx = 0; idx < messages.length; idx++) {
      await resendMessage(messages[idx]);
      await deleteMessage(messages[idx].id);
    }
    res.json({ "success": "messages resent" });
  } catch (err) {
    res.send({ "error": "failed to resend messages" })
  }
})

router.delete('/deleteMessage/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await deleteMessage(id);
    res.json({ "success": "message deleted" });
  } catch (err) {
    res.send({ "error": "failed to delete message" });
  }
});

router.delete('/deleteAllMessages', async (req, res) => {
  try {
    const messages = await getAllMessages();
    for (let idx = 0; idx < messages.length; idx++) {
      await deleteMessage(messages[idx].id)
    }
    res.json({ "success": "messages deleted" });
  } catch (err) {
    res.send({ "error": "failed to delete messages" })
  }
})

module.exports = router;