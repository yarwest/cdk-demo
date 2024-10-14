import { CfnParameter, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from "aws-cdk-lib/aws-lambda";
import {APIConstruct} from "./api-construct";

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const LambdaServiceRole = new Role(this, 'LambdaServiceRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    LambdaServiceRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ['*'],
        actions: [
          'comprehend:BatchDetectSentiment'
        ]
      })
    );

    const twitterAPIKey = new CfnParameter(this, "twitterApiKey", {
      type: "String",
      description: "API key to perform requests to the Twitter api."});

    const lambdaFunction = new lambda.Function(this, 'RestApiHandler', {
      code: lambda.Code.fromAsset('lib/lambda/getTweets'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      role: LambdaServiceRole,
      environment: {
        TWITTER_API_KEY: twitterAPIKey.valueAsString
      }
    });

    const apiConstruct = new APIConstruct(this, 'APIConstruct', {
      lambdaFunction,
    });
  }
}
