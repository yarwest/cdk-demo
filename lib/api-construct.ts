import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import {Cors, LambdaRestApi} from "@aws-cdk/aws-apigateway";
import * as ssm from "@aws-cdk/aws-ssm";

type APIProps = {
  lambdaFunction: lambda.Function,
}

export class APIConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: APIProps) {
    super(scope, id);

    const api = new LambdaRestApi(this, 'RestAPIConsumer', {
      // @ts-ignore
      handler: props.lambdaFunction,
      proxy: false,
      description: 'Rest API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS
      }
    })

    const apiKey = '12345678901234567890';

    api.addApiKey('ApiKey', {
      apiKeyName: `web-app-key`,
      value: apiKey,
    });

    new ssm.StringParameter(this, 'apiKeyParameter', {
      parameterName: '/CDKDemo/apiKey',
      stringValue: apiKey,
    });
    new ssm.StringParameter(this, 'apiURLParameter', {
      parameterName: '/CDKDemo/apiURL',
      stringValue: api.url
    });

    const FetchTweets = api.root.addResource('FetchTweets');
    FetchTweets.addMethod('GET');
  }
}
