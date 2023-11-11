#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { CdkStack } from "../lib/cdk-stack";

// istantiate the cdk for this app
const app = new cdk.App();

// pre-flight checks - set common variables that are used across all stacks
const awsRegion: string | undefined =
  process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || "us-east-1";
const awsAccount: string | undefined =
  // process.env.AWS_ACCOUNT || "000000000000";
  process.env.AWS_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;

if (!awsRegion || !awsAccount) {
  throw new Error(
    "Please set either the AWS_REGION and AWS_ACCOUNT environment " +
      "variables, or the aws_region and aws_account context values."
  );
}

// define the cdk environment
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
https://taimos.de/blog/deploying-your-cdk-app-to-different-stages-and-environments
 */
/* const cdkEnvironment: cdk.Environment = {
  region: awsRegion,
  account: awsAccount,
}; */
// ========================================================================
// Provision the stack
// ========================================================================
// Development stage
new CdkStack(app, "saas-stack-dev", {
  env: {
    account: awsAccount,
    region: awsRegion,
  },
});
