import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ShcAppCognitoUserPool } from "./cognito";
import { ShcDatabase } from "./database";
import { ShcEventbus } from "./eventbus";
import { ShcTenantApi } from "./tenant-api";
import { ShcTenantService } from "./tenant-service";

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
    const shcTenantService = new ShcTenantService(this, "shc-tenant-service", {
      userPoolId: shcAppCognitoUserPool.userPoolId,
      userPoolClientId: shcAppCognitoUserPool.userPoolClientId,
      tenantTable: shcDatabase.userTable,
      eventbus: shcEventbus.eventBus,
    });

    // ========================================================================
    // Provision tenant api
    // ========================================================================
    const shcTenantApi = new ShcTenantApi(this, "shc-Tenant-api", {
      signupFn: shcTenantService.signupFn,
      signinFn: shcTenantService.signinFn,
      confirmSignupFn: shcTenantService.confirmSignupFn,
      signoutFn: shcTenantService.signoutFn,
      currentUserFn: shcTenantService.currentUserFn,
      postConfirmationFn: shcTenantService.postConfirmationSignupFn,
      preTokenGenerationFn: shcTenantService.preTokenGenerationFn,
    });
  }
}
