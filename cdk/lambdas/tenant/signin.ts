import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthRequest,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Logger } from "/opt/logger";
const log = new Logger();

// Set up AWS Cognito client
const client = new CognitoIdentityProviderClient({
  region: process.env?.region || "us-east-1",
});

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  log.debug(
    "tenant-api",
    "signin",
    `input: "${JSON.stringify(event, undefined, 2)}"`
  );

  if (!event.body) {
    log.debug(
      "tenant-api",
      "signin",
      `message: "Event body is missing - You must provide required parameters"`
    );
    return {
      statusCode: 400,
      body: JSON.stringify({
        name: "Event body is missing",
        message: "You must provide a valid username and password",
      }),
    };
  }

  const { username, password } = JSON.parse(event.body);

  const params: InitiateAuthRequest = {
    ClientId: process.env.USER_POOL_CLIENT_ID!,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    // Call the InitiateAuth API
    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);

    // Check the response for tokens and other information
    if (!response.AuthenticationResult) {
      // Handle authentication failure (e.g., display an error message to the user)
      // console.error("Authentication failed:", response);
      log.debug(
        "tenant-api",
        "signin",
        `message: "User Authentication failed"`,
        response
      );
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "User Authentication failed:",
        }),
      };
    }
    log.info(
      "tenant-api",
      "signin",
      `message: "signin successful: - response : "${response}""`,
      response.AuthenticationResult
    );
    // console.log("[AUTH]", response.AuthenticationResult);
    // get the tokens
    const idToken = response.AuthenticationResult.IdToken;
    const accessToken = response.AuthenticationResult.AccessToken;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Set-Cookie": `token=${idToken}; SameSite=None; Secure; HttpOnly; Path=/; Max-Age=3600;`,
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        message: "User Authentication successful",
        token: { idToken, accessToken },
      }),
    };
  } catch (err: any) {
    log.error(
      "tenant-api",
      "signin",
      `name: "${err.name} - message: "Error signing in: ${err.message}"`,
      err
    );
    return {
      statusCode: err.$metadata.httpStatusCode,
      body: JSON.stringify({
        name: err.name,
        message: err.message,
        // message: `name: "${err.name} - message: "Error signing up: ${err.message}"`,
        type: err.__type,
        err,
      }),
    };
  }
};
