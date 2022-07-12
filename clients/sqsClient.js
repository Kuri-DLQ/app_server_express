const  { SQSClient } = require("@aws-sdk/client-sqs");
require('dotenv').config();
const REGION = process.env.REGION;
const sqsClient = new SQSClient({ region: REGION });
module.exports = { sqsClient };