const express = require('express');
const router = express.Router();
const { getAllMessages, updateMessage, getMessage, resendMessage, deleteMessage, getMessageCount } = require("../controllers/tableController.js");

router.get('/allMessages', async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json(messages)
  } catch (err) {
    res.json({ "error": "error getting all messages" });
  }
});

router.get('/sse', async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  try {
    res.writeHead(200, headers);
    let count = await getMessageCount();
    setInterval(async() => {
      count = await getMessageCount();
      res.write(`data: ${count}`);
      // let messages = await getAllMessages();
      // res.write(`data: ${messages}`);
      res.write('\n\n');
    }, 5000);
    // client.stream = res; // store response obj to be written to later
  } catch (err) {
    res.json({ "error": "error getting count of messages" });
  }

});

router.put('/updateMessage/:id', async (req, res) => {
  const id = req.params.id;
  const message = req.body;

  try {
    const updated = await updateMessage(id, message);
    res.json(updated);
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