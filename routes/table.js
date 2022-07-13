const express = require('express');
const router = express.Router();
const { getAllMessages, updateMessage, getMessage, resendMessage, deleteMessage } = require("../controllers/tableController.js");

router.get('/allMessages', async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json(messages)
  } catch (err) {
    res.json({ "error": "error getting all messages" });
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

router.delete('/deleteMessage/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    await deleteMessage(id);
    res.json({ "sucess": "message deleted" });
  } catch (err) {
    res.send({ "error": "failed to delete message" });
  }
});

module.exports = router;