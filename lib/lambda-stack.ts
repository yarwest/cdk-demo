import * as cdk from '@aws-cdk/core';
import {Effect, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from "@aws-cdk/aws-lambda";
import {APIConstruct} from "./api-construct";
import {CfnParameter} from "@aws-cdk/core";

export class LambdaStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string) {
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
      code: lambda.Code.fromAsset('lib/lambda/getTweets/dist'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
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
