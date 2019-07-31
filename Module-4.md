### Fixing the bug!

We saw the following error message at the end of the function invocation logs:
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