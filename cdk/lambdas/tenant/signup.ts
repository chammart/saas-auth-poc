import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Logger } from "/opt/logger";
const log = new Logger();

// Set up AWS Cognito client
const client = new CognitoIdentityProviderClient({
  region: process.env?.region || "us-east-1",
});

type eventBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
};

// Registers the user in the specified user pool and creates a user name, password, and user attributes.

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  log.debug(
    "tenant-api",
    "signup",
    `input: "${JSON.stringify(event, undefined, 2)}"`
  );

  if (!event.body) {
    log.debug(
      "tenant-api",
      "signup",
      `message: "Event body is missing - You must provide required parameters"`
    );
    return {
      statusCode: 400,
      body: JSON.stringify({
        name: "Event body is missing",
        message: "You must provide required parameters",
      }),
    };
  }

  const { email, password, firstName, lastName, country }: eventBody =
    JSON.parse(event.body);

  // Define signup parameters
  const params: SignUpCommandInput = {
    ClientId: process.env.USER_POOL_CLIENT_ID!,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      // { Name: "birthdate", Value: "06-04-1990" },
      { Name: "family_name", Value: lastName },
      { Name: "given_name", Value: firstName },
      //{ Name: "address", Value: "105 Main St. New York, NY 10001" },
      { Name: "custom:country", Value: country },
    ],
  };

  try {
    // Call the SignUp API
    const command = new SignUpCommand(params);
    const response = await client.send(command);
    log.info(
      "tenant-api",
      "signup",
      `message: "Signup successful: - response : "${response}""`,
      response
    );
    // You can handle success or redirect the user to a confirmation page
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: response,
      }),
    };
  } catch (err: any) {
    log.error(
      "tenant-api",
      "signup",
      `name: "${err.name} - message: "Error signing up: ${err.message}"`,
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
