const { ScanCommand, PutItemCommand, GetItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { ddbClient } = require("../clients/ddbClient.js");
const { sqsClient } = require("../clients/sqsClient.js");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { SendMessageCommand } = require("@aws-sdk/client-sqs");
require('dotenv').config();

const getAllMessages = async () => {
  const params = {
    TableName: process.env.TABLE_NAME,
  };
  
  try {
    const data = await ddbClient.send(new ScanCommand(params));
    return data.Items.map(message => unmarshall(message));
  } catch (err) {
    console.log("Error", err);
  }
}

const getMessage = async (messageID) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      email_id: { S: messageID },
    }
  };
  try {
    const data = await ddbClient.send(new GetItemCommand(params))
    console.log(unmarshall(data.Item));
    return unmarshall(data.Item);
  } catch (err) {
    console.log("Error", err);
  }
}

const updateMessage = async (messageID, updatedMessage) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      email_id: { S: messageID },
      name: { S: updatedMessage.name }
    }
  };

  try {
    const data = await ddbClient.send(new PutItemCommand(params));
    console.log("Success, message updated", data);
    const newMessage = await getMessage(messageID);
    return newMessage;
  } catch (err) {
    console.log("Error", err);
  }
}

const resendMessage = async (message) => {
  const params = {
    // Can add MessageAttributes here
    MessageBody: JSON.stringify(message),
    QueueUrl: process.env.QUEUE_URL || 'MainQueue'
  }

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Success, message sent:", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
}

const deleteMessage = async (messageID) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      email_id: { S: messageID },
    },
  };

  try {
    const data = await ddbClient.send(new DeleteItemCommand(params));
    console.log("Success, message deleted", data);
  } catch (err) {
    console.log("Error", err);
  }
}

module.exports = { getAllMessages, updateMessage, resendMessage, getMessage, deleteMessage };

