import * as cdk from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import { EventBus } from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ShcTenantServiceProps {
  // the userpool
  readonly userPoolId: string;
  readonly userPoolClientId: string;

  // the tables
  readonly tenantTable: ddb.ITable;
  // readonly userTable: ddb.ITable;

  // the event bus
  readonly eventbus: EventBus;
}

export class ShcTenantService extends Construct {
  public readonly signupFn: lambda.Function;
  public readonly signoutFn: lambda.Function;
  public readonly confirmSignupFn: lambda.Function;
  public readonly signinFn: lambda.Function;
  public readonly currentUserFn: lambda.Function;
  public readonly postConfirmationSignupFn: lambda.Function;
  public readonly preTokenGenerationFn: lambda.Function;

  // the layer for the common features
  public readonly layer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props: ShcTenantServiceProps) {
    super(scope, id);

    // ----------------------------------------
    //   Lambda layer for sharing utility functions
    // ----------------------------------------
    this.layer = new lambda.LayerVersion(this, "shc-shared-functions-layer", {
      code: lambda.Code.fromAsset("lambdas/shared"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      license: "Apache-2.0",
      description: "Layer for common features",
    });

    // ----------------------------------------
    //   Cognito Lambda functions
    // ----------------------------------------

    // signupFn
    this.signupFn = this.createService(
      this,
      "signup",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.signupFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });
    // Add the userpooid and userpool clientId as environement variable
    this.signupFn.addEnvironment("USER_POOL_ID", props.userPoolId);
    this.signupFn.addEnvironment("USER_POOL_CLIENT_ID", props.userPoolClientId);

    // confirmSignupFn
    this.confirmSignupFn = this.createService(
      this,
      "confirm-signup",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.confirmSignupFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });

    // Add the userpooid and userpool clientId as environement variable
    this.confirmSignupFn.addEnvironment("USER_POOL_ID", props.userPoolId);
    this.confirmSignupFn.addEnvironment(
      "USER_POOL_CLIENT_ID",
      props.userPoolClientId
    );

    // signinFn
    this.signinFn = this.createService(
      this,
      "signin",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.signinFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });

    // Add the userpooid and userpool clientId as environement variable
    this.signinFn.addEnvironment("USER_POOL_ID", props.userPoolId);
    this.signinFn.addEnvironment("USER_POOL_CLIENT_ID", props.userPoolClientId);

    // signoutFn
    this.signoutFn = this.createService(
      this,
      "signout",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.signoutFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });

    // Add the userpooid and userpool clientId as environement variable
    this.signoutFn.addEnvironment("USER_POOL_ID", props.userPoolId);
    this.signoutFn.addEnvironment(
      "USER_POOL_CLIENT_ID",
      props.userPoolClientId
    );

    // currentUserFn
    this.currentUserFn = this.createService(
      this,
      "current-user",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.currentUserFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });

    // Add the userpooid and userpool clientId as environement variable
    this.currentUserFn.addEnvironment("USER_POOL_ID", props.userPoolId);
    this.currentUserFn.addEnvironment(
      "USER_POOL_CLIENT_ID",
      props.userPoolClientId
    );

    // postConfirmationFn
    this.postConfirmationSignupFn = this.createService(
      this,
      "post-signup-confirmation",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.postConfirmationSignupFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });

    // Add the userpooid and userpool clientId as environement variable
    this.postConfirmationSignupFn.addEnvironment(
      "USER_POOL_ID",
      props.userPoolId
    );
    this.postConfirmationSignupFn.addEnvironment(
      "USER_POOL_CLIENT_ID",
      props.userPoolClientId
    );

    // preTokenGenerationFn
    this.preTokenGenerationFn = this.createService(
      this,
      "pre-token-generation",
      "tenant",
      props.tenantTable,
      props.eventbus,
      this.layer
    );

    // AWS Lambda functions need permissions to interact with all the userpool
    this.preTokenGenerationFn.addPermission("shc-CognitoPermission", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:userpool/*`,
    });

    // Add the userpooid and userpool clientId as environement variable
    this.preTokenGenerationFn.addEnvironment("USER_POOL_ID", props.userPoolId);
    this.preTokenGenerationFn.addEnvironment(
      "USER_POOL_CLIENT_ID",
      props.userPoolClientId
    );
  }

  /**
   * Helper function to shorten Lambda boilerplate as we have 6 in this stack
   * @param scope
   * @param serviceName
   * @param servicePath
   * @param table
   * @param handler
   * @param eventBus
   * @param layer
   */
  createService(
    scope: Construct,
    serviceName: string,
    servicePath: string,
    table: ddb.ITable,
    eventBus: EventBus,
    layer: lambda.LayerVersion
  ): lambda.Function {
    // Create a Node Lambda with the table name passed in as an environment variable
    let fn = new lambda.Function(scope, serviceName, {
      functionName: serviceName,
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
      code: lambda.Code.fromAsset(`lambdas/${servicePath}`),
      tracing: lambda.Tracing.ACTIVE,
      handler: `${serviceName}.handler`,
      layers: [layer],
      environment: {
        TABLE_NAME: table.tableName,
        PRIMARY_KEY: "pk",
        SORT_KEY: "sk",
      },
    });

    // Give our Lambda permissions to read and write data from the passed in DynamoDB table
    table.grantReadWriteData(fn);
    // Give our Lambda permissions to send events to to the eventbus
    eventBus.grantPutEventsTo(fn);

    return fn;
  }
}
