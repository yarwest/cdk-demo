#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import {FrontendStack} from "../lib/frontend-stack";
import {LambdaStack} from "../lib/lambda-stack";

const app = new App();
const lambdaStack = new LambdaStack(app, 'LambdaStack');
const frontendStack = new FrontendStack(app, 'FrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});
