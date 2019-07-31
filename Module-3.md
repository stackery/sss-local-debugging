### Time to dig in and debug!
Now that we have a sense of what happened when we sent a message to the SNS topic, let's now start debugging the code. First, we need to get the code. The code is in this repository under [src/Function](src/Function). Using your favorite tools/IDE, clone this repo to pull down the source code.

Now, let's change into the src/Function directory. The first thing we'll want to do is create an event.json file containing the sample event from the logs we fetched in the previous step. The command we ran was:
```
aws logs filter-log-events --log-group-name /aws/lambda/sss-sns-to-db-Function --query 'events[*].[message]' --output text | tr '\r' '\n'
```

It should look something like:
```JSON
{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:us-east-1:0123456789012:sss-sns-to-db-Topic:7b35d6ce-78b5-4344-8065-22aae6fb0a8e",
      "Sns": {
        "Type": "Notification",
        "MessageId": "f6a2563e-a736-5398-a03b-03843d18f7ed",
        "TopicArn": "arn:aws:sns:us-east-1:0123456789012:sss-sns-to-db-Topic",
        "Subject": null,
        "Message": "Hello World!",
        "Timestamp": "2019-07-30T19:18:06.502Z",
        "SignatureVersion": "1",
        "Signature": "TNbfbOev+i3yN8JpLKFC35HAzSwhYrwKCZhEVdMKq20VKIZXpIjlpUUy7A1uFTLck+DrVz6onhWwX5mtySo2RRMSC/yRe0jrZL+e3TLJoUxSdDCyKzc1lVXE+dJrEtE7J36CDnFu9aWayyYn0gVzNhBJfSfkffr2ZNkH/PAESZMkMIlKPCJ34oKPR1UQsEY/ZqFiGfJDKUOfYhc0Y8N0r69SBSDrW7zi5dYewqX/M6QASXN0v+IvucJTSvK8locMLpVwBL1WDNAKgZzH45sMZQucE760iiDUVHAY7HajagqJ9YjVTMC1eChGBUxbjAyG/ZWF+4ewAmmI/BI1UM0eiQ==",
        "SigningCertUrl": "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-6aad65c2f9911b05cd53efda11f913f9.pem",
        "UnsubscribeUrl": "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:0123456789012:sss-sns-to-db-Topic:7b35d6ce-78b5-4344-8065-22aae6fb0a8e",
        "MessageAttributes": {}
      }
    }
  ]
}
```

We're going to debug the function we provisioned in AWS Lambda using the IAM Role and environment variable values it was provisioned with. This enables us to locate and access the DynamoDB table to store the SNS message into. To debug the function, we need to know its ARN. The ARN looks like:
```
arn:aws:lambda:<region>:<AWS account ID>:function/sss-sns-to-db-Function
```

You can get your region and account ID by running the following commands:
```
aws configure get region
aws sts get-caller-identity
```

Now that we have an ARN for our function, we can use the `stackery local invoke` command to run the function locally:
```
stackery local invoke --function-arn arn:aws:lambda:<region>:<AWS account ID>:function:sss-sns-to-db-Function --event event.json --watch
```

The `--watch` argument will tell the stackery CLI to re-invoke the function every time a source file changes in the current directory, src/Function/.

Now it's time to have some fun :). You should see an error message at the end of the function invocation logs:
```JSON
{
  "errorType": "ValidationException",
  "errorMessage": "One or more parameter values were invalid: Missing the key id in the item"
}
```

This error message occurs because the DynamoDB PutItem request is missing a value for the hash key attribute for the table. Our table's hash key ID is `id`, so we simply need to add a reasonable value for it in the item we are putting. Let's update our request in index.js:

```javascript
for (const record of event.Records) {
  await ddb.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      id: record.Sns.MessageId, // Add this line to set the 'id' attribute
      ...record.Sns
    }
  }).promise();
}
```

### Success!
After saving the file with the additional `id` attribute in the PutItem request, the function should re-invoke in your terminal. It should show a "Success!" message printed to the terminal.

If you want to see the results in the DynamoDB table, you can run:
```
aws dynamodb scan --table-name sss-sns-to-db-Table --query 'Items[*]' --output text
```