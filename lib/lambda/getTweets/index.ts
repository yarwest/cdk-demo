import {APIGatewayProxyHandler, Callback, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { BatchDetectSentimentResponse } from 'aws-sdk/clients/comprehend';
import * as https from 'https';

const BEARER_TOKEN = process.env.TWITTER_API_KEY;
const maxTweets = 25;
const URL = "api.twitter.com"

const handler: APIGatewayProxyHandler = (
  event: APIGatewayProxyEvent,
  context: any,
  callback: Callback,
) => {
  try {
    let query =  event.queryStringParameters && event.queryStringParameters.query ? event.queryStringParameters.query : '#aws';
    query = query.replace('#', '%23');

    let resultString = '';
    const req = https.get({
      host: URL,
      path: `/2/tweets/search/recent?query=${query}%20(lang%3AEN%20OR%20lang%3APL)&max_results=${maxTweets}`,
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      }}, (res) => {
      res.on('data', chunk => {
        resultString += chunk;
      });

      res.on('end', () => {
        const results = JSON.parse(resultString).data;
        // @ts-ignore
        const tweetList = results.map(t => t.text);

        const comprehendClient = new AWS.Comprehend();
        comprehendClient.batchDetectSentiment({
          TextList: tweetList,
          LanguageCode: 'en'
        }).promise().then((response: BatchDetectSentimentResponse) => {
          const res: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              "Content-Type": "*/*",
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
              // @ts-ignore
              tweets: tweetList.map((tweet, i) => {
                const result = response.ResultList.find((r) => r.Index === i);

                if(!result) return;

                return {
                  text: tweet,
                  sentiment: result.Sentiment,
                  // @ts-ignore
                  sentimentScore: result.SentimentScore[result.Sentiment]
                }
              }),
            }),
          };
          callback(null, res);
        });
      });
    });

    req.on('error', (e) => {
      callback(null, {
        statusCode: 500,
        body: 'Something went wrong!' + e.message
      });
    });
  } catch (e) {
    console.log(e);
    // @ts-ignore
    callback(e, {
      "statusCode": 500,
    } as APIGatewayProxyResult);
  }
};

export { handler };
export default handler;