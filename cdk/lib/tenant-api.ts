/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { CfnOutput } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

// Properties for the protectedApi-construct
export interface TenantApiProps {
  // the lambda handler
  signupFn: lambda.Function;
  confirmSignupFn: lambda.Function;
  signinFn: lambda.Function;
  signoutFn: lambda.Function;
  currentUserFn: lambda.Function;
  postConfirmationFn: lambda.Function;
  preTokenGenerationFn: lambda.Function;
}

// Construct
export class ShcTenantApi extends Construct {
  readonly api: apigateway.LambdaRestApi;

  // Constructor
  constructor(scope: Construct, id: string, props: TenantApiProps) {
    super(scope, id);

    // Setup the Tenantentication Service RestApi
    // Tenant microservices api gateway
    this.api = new apigateway.RestApi(this, "shc-tenant-api", {
      restApiName: "shc-tenant-api",
      description: "Tenant Service RestApi",
    });

    /* this.api = new apigateway.LambdaRestApi(this, "shc-tenant-api", {
      restApiName: "shc-tenant-api",
      handler: props.tenantLambda,
      proxy: false,
      // deploy: false
    }); */

    // add default gateway responses
    this.getDefaultGatewayResponses(this.api);

    // root name = tenant
    const tenantApi = this.api.root.addResource("tenant");
    tenantApi.addCorsPreflight(this.getCorsOptions());

    // feature name = /signup
    const signupTenantApi = tenantApi.addResource("signup");
    const signupTenantIntegration = new apigateway.LambdaIntegration(
      props.signupFn,
      {
        proxy: true,
      }
    );

    signupTenantApi.addMethod("POST", signupTenantIntegration, {
      methodResponses: this.getDefaultMethodResponses(),
    });

    // feature name = /signin
    const signinTenantApi = tenantApi.addResource("signin");
    const signinTenantIntegration = new apigateway.LambdaIntegration(
      props.signinFn,
      {
        proxy: true,
      }
    );

    signinTenantApi.addMethod("POST", signinTenantIntegration, {
      methodResponses: this.getDefaultMethodResponses(),
    });

    // feature name = /signout
    const signoutTenantApi = tenantApi.addResource("signout");
    const signoutTenantIntegration = new apigateway.LambdaIntegration(
      props.signoutFn,
      {
        proxy: true,
      }
    );

    signoutTenantApi.addMethod("GET", signoutTenantIntegration, {
      methodResponses: this.getDefaultMethodResponses(),
    });

    // feature name = /confirm-signup
    const confirmSignupTenantApi = tenantApi.addResource("confirm-signup");
    const confirmSignupTenantIntegration = new apigateway.LambdaIntegration(
      props.confirmSignupFn,
      {
        proxy: true,
      }
    );

    confirmSignupTenantApi.addMethod("POST", confirmSignupTenantIntegration, {
      methodResponses: this.getDefaultMethodResponses(),
    });

    // feature name = /current-user
    const currentUserTenantApi = tenantApi.addResource("current-user");
    const currentUserTenantIntegration = new apigateway.LambdaIntegration(
      props.currentUserFn,
      {
        proxy: true,
      }
    );

    currentUserTenantApi.addMethod("GET", currentUserTenantIntegration, {
      methodResponses: this.getDefaultMethodResponses(),
    });

    // ----------------------------------------
    //           export values
    // ----------------------------------------
    new CfnOutput(this, "RestApiName", {
      value: this.api.restApiName,
    });
    new CfnOutput(this, "apiUrl", {
      value: this.api.url,
    });
  }

  private getCorsOptions(): apigateway.CorsOptions {
    return {
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST"],
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Tenantorization",
        "Identification",
        "X-Api-Key",
        "X-Amz-Security-Token",
      ],
    };
  }

  private getDefaultMethodResponses(): apigateway.MethodResponse[] {
    const response: apigateway.MethodResponse[] = [
      {
        // Successful response from the integration
        statusCode: "200",
        // Define what parameters are allowed or not
        responseParameters: {
          "method.response.header.Content-Type": true,
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Origin": true,
          // 'method.response.header.Access-Control-Allow-Credentials': false
        },
        // Validate the schema on the response
        responseModels: {
          "application/json": apigateway.Model.EMPTY_MODEL,
        },
      },
      {
        // Same thing for the error responses
        statusCode: "400",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
      {
        // Same thing for the error responses
        statusCode: "401",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.x-amzn-Remapped-WWW-Tenantenticate": true,
        },
      },
      {
        // Same thing for the error responses
        statusCode: "404",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
    ];

    return response;
  }

  private getDefaultResponseHeader(): { [key: string]: string } {
    return {
      "Access-Control-Allow-Headers":
        "'Content-Type,X-Amz-Date,Tenantorization,Identification,X-Api-Key,X-Amz-Security-Token'",
      "Access-Control-Allow-Methods": "'OPTIONS,POST'",
      "Access-Control-Allow-Origin": "'*'",
    };
  }

  private getDefaultGatewayResponses(api: apigateway.RestApi) {
    api.addGatewayResponse("default-4xx", {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: this.getDefaultResponseHeader(),
    });

    api.addGatewayResponse("default-5xx", {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: this.getDefaultResponseHeader(),
    });

    // api.addGatewayResponse('access-denied', {
    //   type: apigateway.ResponseType.ACCESS_DENIED,
    //   statusCode: '403',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('api-configuration-error', {
    //   type: apigateway.ResponseType.API_CONFIGURATION_ERROR,
    //   statusCode: '500',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('tenantorizer-configuration-error', {
    //   type: apigateway.ResponseType.AUTHORIZER_CONFIGURATION_ERROR,
    //   statusCode: '500',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('tenantorizer-failure', {
    //   type: apigateway.ResponseType.AUTHORIZER_FAILURE,
    //   statusCode: '500',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('bad-request-body', {
    //   type: apigateway.ResponseType.BAD_REQUEST_BODY,
    //   statusCode: '400',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('bad-request-parameters', {
    //   type: apigateway.ResponseType.BAD_REQUEST_PARAMETERS,
    //   statusCode: '400',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('expired-token', {
    //   type: apigateway.ResponseType.EXPIRED_TOKEN,
    //   statusCode: '403',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('integration-failure', {
    //   type: apigateway.ResponseType.INTEGRATION_FAILURE,
    //   statusCode: '504',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('integration-timeout', {
    //   type: apigateway.ResponseType.INTEGRATION_TIMEOUT,
    //   statusCode: '504',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('invalid-api-key', {
    //   type: apigateway.ResponseType.INVALID_API_KEY,
    //   statusCode: '403',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('invalid-signature', {
    //   type: apigateway.ResponseType.INVALID_SIGNATURE,
    //   statusCode: '403',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('missing-tenantentication-token', {
    //   type: apigateway.ResponseType.MISSING_AUTHENTICATION_TOKEN,
    //   statusCode: '403',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('quota-exceeded', {
    //   type: apigateway.ResponseType.QUOTA_EXCEEDED,
    //   statusCode: '429',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('request-too-large', {
    //   type: apigateway.ResponseType.REQUEST_TOO_LARGE,
    //   statusCode: '413',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('resource-not-found', {
    //   type: apigateway.ResponseType.RESOURCE_NOT_FOUND,
    //   statusCode: '404',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('throttled', {
    //   type: apigateway.ResponseType.THROTTLED,
    //   statusCode: '429',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('untenantorized', {
    //   type: apigateway.ResponseType.UNAUTHORIZED,
    //   statusCode: '401',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('unsupported-media-type', {
    //   type: apigateway.ResponseType.UNSUPPORTED_MEDIA_TYPE,
    //   statusCode: '415',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });

    // api.addGatewayResponse('waf-filtered', {
    //   type: apigateway.ResponseType.WAF_FILTERED,
    //   statusCode: '403',
    //   responseHeaders: this.getDefaultResponseHeader()
    // });
  }
}
