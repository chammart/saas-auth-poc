/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { Logger } from "/opt/logger";
const log = new Logger();

// Set up AWS Cognito client
const client = new CognitoIdentityProviderClient({
  region: process.env?.region || "us-east-1",
});

type eventBody = { username: string; code: string };

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  log.debug(
    "tenant-api",
    "confirm-signup",
    `input: "${JSON.stringify(event, undefined, 2)}"`
  );

  if (!event.body) {
    log.debug(
      "tenant-api",
      "confirm-signup",
      `message: "You must provide a a username and a verifcation code"`
    );
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "You must provide a a username and a verifcation code",
      }),
    };
  }

  const { username, code }: eventBody = JSON.parse(event.body);

  // Define confirmation parameters
  const params: ConfirmSignUpCommandInput = {
    ClientId: process.env.USER_POOL_CLIENT_ID!,
    Username: username,
    ConfirmationCode: code,
  };

  try {
    // Call the ConfirmSignUp API
    const command = new ConfirmSignUpCommand(params);
    const response = await client.send(command);
    log.info(
      "tenant-api",
      "confirm-signup",
      `message: "Confirmation successful: - response : "${response}""`,
      response
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ${username} successfully confirmed`,
        confirmed: true,
        response,
      }),
    };
  } catch (err: any) {
    log.error(
      "tenant-api",
      "confirm-signup",
      `name: "${err.name} - message: "Error confirming signing up: ${err.message}"`,
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
