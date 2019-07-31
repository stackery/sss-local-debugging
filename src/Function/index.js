const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));

  console.log(process.env.AWS_DEFAULT_REGION);

  for (const record of event.Records) {
    await ddb.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        ...record.Sns
      }
    }).promise();
  }

  console.log('Success!');
};
