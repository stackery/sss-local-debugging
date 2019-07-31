### Send a test SNS message
Now let's send a message to our SNS topic. This will trigger our function to run once.

> We're going to use the AWS CLI in this and many following steps because CLI commands are easy to copy/paste. But these are quite long commands. It's not normal to try to use the CLI commands this way for all debugging purposes, lots of times you dive into the AWS console (or the Stackery console for that matter!) instead. We'll see what that looks like in future Summer Serverless School workshops!

First, we need to get the AWS Resource Name (ARN) of the topic.
```
aws cloudformation describe-stack-resources --stack-name sss-sns-to-db --logical-resource-id Topic --output text --query 'StackResources[0].PhysicalResourceId'
```

Now, run the following command to publish a message:
```
aws sns publish --topic-arn <Topic ARN from previous command> --message 'Hello World!'
```

### What happened?
We've sent an SNS message successfully, but the result of the publish command doesn't tell us anything about what happened when our function was invoked. Let's check it out!

```
aws logs filter-log-events --log-group-name /aws/lambda/sss-sns-to-db-Function --query 'events[*].[message]' --output text | tr '\r' '\n'
```

> We pipe the output into `tr` to convert carriage returns into line feeds for unix terminals. Otherwise, the output would be garbled in our terminal. If you're on Windows, simply omit the `| tr -d '\r'` on the end of the command.

You should see something like:
```
2019-07-30T19:21:18.924Z        dacce4d0-203c-4321-b705-94b42845f482    INFO    {
  "Records": [
    ...
  ]
}

2019-07-30T19:21:19.444Z        dacce4d0-203c-4321-b705-94b42845f482    ERROR   Invoke Error    {"errorType":"ValidationException","errorMessage":"One or more parameter values were invalid: Missing the key id in the item", ...}
```

The first log entry shows the SNS event message the Function was invoked with. The second entry shows the error in our function.

## [Continue To Module 3!](./Module-3.md)