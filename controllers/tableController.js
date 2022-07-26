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
      id: { S: messageID },
    }
  };
  try {
    const data = await ddbClient.send(new GetItemCommand(params))
    return unmarshall(data.Item);
  } catch (err) {
    console.log("Error", err);
  }
}

const updateMessage = async (messageID, updatedMessage) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      id: { S: messageID },
      Message: { S: updatedMessage.Message },
      Attributes: { S: JSON.stringify(updatedMessage.Attributes) },
      Timestamp: { S: updatedMessage.Timestamp }
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

const convertMessageAtts = (attributes) => {
  const result = {};
  for (const key in attributes) {
    result[key] = {
      "DataType": `${attributes[key]["Type"]}`,
      "StringValue": `${attributes[key]["Value"]}`
    }
  }

  return result;
}

const resendMessage = async (message) => {
  const params = {
    MessageAttributes: convertMessageAtts(JSON.parse(message.Attributes)),
    MessageBody: message.Message,
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
      id: { S: messageID },
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

