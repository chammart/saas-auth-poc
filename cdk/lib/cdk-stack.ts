import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ShcAuthApi } from "./auth-api";
import { ShcAppCognitoUserPool } from "./cognito";
import { ShcDatabase } from "./database";
import { ShcEventbus } from "./eventbus";
import { ShcService } from "./lambdas";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================================================
    // Provision eventbus
    // ========================================================================
    const shcEventbus = new ShcEventbus(this, "shc-eventbus", {});

    // ========================================================================
    // Provision cognito
    // ========================================================================
    const shcAppCognitoUserPool = new ShcAppCognitoUserPool(
      this,
      "shc-app-cognito-userPool",
      {}
    );

    // ========================================================================
    // Provision database tables
    // ========================================================================
    const shcDatabase = new ShcDatabase(this, "shc-tables");

    // ========================================================================
    // Provision lambdas
    // ========================================================================
    const shcService = new ShcService(this, "shc-lambdas", {
      userPoolId: shcAppCognitoUserPool.userPoolId,
      userPoolClientId: shcAppCognitoUserPool.userPoolClientId,
      userTable: shcDatabase.userTable,
      tenantTable: shcDatabase.userTable,
      eventbus: shcEventbus.eventBus,
    });

    // ========================================================================
    // Provision auth api
    // ========================================================================
    const shcAuthApi = new ShcAuthApi(this, "shc-AuthApi", {
      signupFn: shcService.signupFn,
      signinFn: shcService.signinFn,
      confirmSignupFn: shcService.confirmSignupFn,
      signoutFn: shcService.signoutFn,
      currentUserFn: shcService.currentUserFn,
      postConfirmationFn: shcService.postConfirmationFn,
      preTokenGenerationFn: shcService.preTokenGenerationFn,
    });
  }
}
