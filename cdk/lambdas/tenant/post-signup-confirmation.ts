/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 *
 */
import { PostConfirmationTriggerEvent } from "aws-lambda";
import { PutCommand, QueryCommand, ddbClient } from "/opt/db-access";

import { Logger } from "/opt/logger";
const log = new Logger();

const TABLE_NAME = process.env.TABLE_NAME!;

// Disable automatic export
export { };

async function queryTenantIdByUserPoolAndAppClientId(userPoolId: string, appClientId: string) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "userpool-appclient-index",
    KeyConditionExpression: "userPoolId = :userPoolId AND appClientId = :appClientId",
    ExpressionAttributeValues: {
      ":userPoolId": userPoolId,
      ":appClientId": appClientId,
    },
  });
  const res = await ddbClient.send(command);
  return res.Items?.[0]?.pk.split("#")[1]!;
}

async function addTenant(tenantId: string, sub: string, email: string, cognitoUserName: string) {
  const displayName = cognitoUserName.substring(`external-idp-${tenantId}_`.length)
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      pk: `tenant#${tenantId}`,
      sk: `membership#${sub}`,
      displayName,
      email,
      role: "member",
      type: "FEDERATION_USER",
      cognitoUserName,
    }
  });

  await ddbClient.send(command);
}

// Handler
export async function handler(event: PostConfirmationTriggerEvent) {
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }
  console.log("request:", JSON.stringify(event, undefined, 2));
  let name = "you";
  let city = "World";
  let time = "day";
  let day = "";
  // Add the item to the database
  if (event.queryStringParameters && event.queryStringParameters.name) {
    console.log("Received name: " + event.queryStringParameters.name);
    name = event.queryStringParameters.name;
  }

  if (event.queryStringParameters && event.queryStringParameters.city) {
    console.log("Received city: " + event.queryStringParameters.city);
    city = event.queryStringParameters.city;
  }

  if (event.headers && event.headers["day"]) {
    console.log("Received day: " + event.headers.day);
    day = event.headers.day;
  }

  if (event.body) {
    let body = JSON.parse(event.body);
    if (body.time) time = body.time;
  }

  let greeting = `Good ${time}, ${name} of ${city}.`;
  if (day) greeting += ` Happy ${day}!`;

  let responseBody = {
    message: greeting,
    input: event,
  };

  console.log("response: " + JSON.stringify(responseBody));

  return {
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify(responseBody),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
