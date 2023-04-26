# cdk-demo

This repository contains the code for a demo application which was used during my presentation at CodeEurope at PGE National Stadium in Warsaw on September 23rd 2021.
The goal of the application is to allow users to search for tweets on Twitter based on a query (such as "#CodeEurope") and analyse the sentiment of the tweets using the sentiment detection functionality provided by [Amazon Comprehend](https://aws.amazon.com/comprehend/).

The code consists of:
- a front-end, written in plain HTML using a [Handlebars](https://handlebarsjs.com/) template
- a `getTweets` [AWS Lambda](https://aws.amazon.com/lambda/) function written in TypeScript
- CDK code to deploy the front-end and Lambda function

## Front-end
The front-end is rather simple, as it consists of an input field where users can input their query, and a button to fetch tweets. Upon clicking the button, an HTTP request is sent to the `getTweets` Lambda, which responds with a list of tweets along with their detected sentiment.

## getTweets Lambda
The Lambda function receives the request from the front-end along with the query string. This query is then sent to an API provided by Twitter, which returns the tweets matching said query.
Upon receiving the tweets, the Lambda function obtains the sentiment analysis by passing the tweets to the `batchDetectSentiment` function provided by the Comprehend client which is part of the [AWS SDK](https://aws.amazon.com/sdk-for-javascript/).
Once the analysis is completed, the result is sent back to the front-end along with the tweets.

## CDK Code
The CDK code is responsible for provisioning the resources required for the deployment of this application. These resources include:
- an [Amazon S3](https://aws.amazon.com/s3/) bucket for hosting the front-end (see `lib/frontend-stack.ts`)
- a Lambda function to execute the `getTweets` logic (see `lib/lambda-stack.ts`)
- an [Amazon API Gateway](https://aws.amazon.com/api-gateway/) which receives the HTTP request from the front-end and invokes the Lambda function (see `lib/api-construct.ts`)

In order to properly secure the API Gateway from unauthorized third parties, an API key is set up during the provisioning.
However, the dynamic provisioning of the API creates a challange. The front-end needs to be aware of the URL at which the API is available, and it needs to know the API key to be able to submit requests to the API.
This information needs to be dynamically injected into the front-end during the provisioning stage, which is why the front-end is stored in a `.handlebars` file instead of an `.html` file.
During the deployment of the `frontend-stack` the Handlebars template is transformed into an `.html` which includes the injected API URL & key, which is then deployed to the S3 bucket. 
