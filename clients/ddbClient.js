const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();
const REGION = process.env.REGION;
const ddbClient = new DynamoDBClient({ region: REGION });
module.exports = { ddbClient };