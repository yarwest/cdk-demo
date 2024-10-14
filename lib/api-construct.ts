import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import {Cors, LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import * as ssm from "aws-cdk-lib/aws-ssm";

type APIProps = {
  lambdaFunction: lambda.Function,
}

export class APIConstruct extends Construct {
  constructor(scope: Construct, id: string, props: APIProps) {
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
