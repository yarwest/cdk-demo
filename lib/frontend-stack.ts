import * as cdk from "@aws-cdk/core";
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as ssm from '@aws-cdk/aws-ssm';
import * as handlebars from 'handlebars';
import { readFileSync, writeFileSync } from 'fs';
import { RemovalPolicy } from "@aws-cdk/core";

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // @ts-ignore
    const apiURL = ssm.StringParameter.valueFromLookup(this, '/CDKDemo/apiURL');

    // @ts-ignore
    const apiKey = ssm.StringParameter.valueFromLookup(this, '/CDKDemo/apiKey');

    // inject api key and url in front-end
    const template = handlebars.compile(readFileSync('lib/frontend/index.handlebars', 'utf-8'));
    writeFileSync('lib/frontend/index.html', template({ apiURL, apiKey }));

    const FrontEndBucket = new s3.Bucket(this, 'FrontEndDeploymentBucket', {
      bucketName: `yboelens-eurocode-cdk-demo-frontend-bucket`,
      versioned: true,
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html'
    });

    new s3Deployment.BucketDeployment(
      this,
      'deployStaticWebsite',
      {
        sources: [s3Deployment.Source.asset('lib/frontend', { exclude: ['index.handlebars'] })],
        destinationBucket: FrontEndBucket,
      }
    );
  }
}
