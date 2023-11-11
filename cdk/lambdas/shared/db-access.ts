/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 *
 */

// imports
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: true, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };
const client = new DynamoDBClient({});
// Create an Amazon DynamoDB service client object
const ddbClient = DynamoDBDocumentClient.from(client, translateConfig);

/**
 * Sign up with username, password and other attributes like phone, email
 * @param {String | object} params - The user attributes used for signin
 * @param {String[]} restOfAttrs - for the backward compatability
 * @return - A promise resolves callback data if success
 */
export const scan = async ({
  tableName,
  projectionExpression,
  expressionAttributeNames,
}: {
  tableName: string;
  projectionExpression: string;
  expressionAttributeNames: any;
}) => {
  // Hold the scan results in an array
  let response;
  const command = new ScanCommand({
    ProjectionExpression: projectionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    TableName: tableName,
  });
  // Perform the operation
  try {
    response = await ddbClient.send(command);
  } catch (err) {
    return err;
  }

  // Return the array of items
  return response;
};

/**
 * Sign up with username, password and other attributes like phone, email
 * @param {String | object} params - The user attributes used for signin
 * @param {String[]} restOfAttrs - for the backward compatability
 * @return - A promise resolves callback data if success
 */
export const query = async ({
  tableName,
  keyConditionExpression,
  expressionAttributeValues,
  consistentRead = true,
}: {
  tableName: string;
  keyConditionExpression: string;
  expressionAttributeValues: any;
  consistentRead: boolean;
}) => {
  // Hold the scan results in an array
  let response;
  const command = new QueryCommand({
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ConsistentRead: consistentRead,
    TableName: tableName,
  });
  // Perform the operation
  try {
    response = await ddbClient.send(command);
    console.log(response);
  } catch (err) {
    console.log(err);
    return err;
  }

  // Return the array of items
  return response;
};

/**
 * Sign up with username, password and other attributes like phone, email
 * @param {String | object} params - The user attributes used for signin
 * @param {String[]} restOfAttrs - for the backward compatability
 * @return - A promise resolves callback data if success
 */
export const createItem = async ({
  tableName,
  item,
}: {
  tableName: string;
  item: any;
}) => {
  // Hold the scan results in an array
  let response;
  // set productid
  const command = new PutCommand({
    Item: item,
    TableName: tableName,
  });
  // Perform the operation
  try {
    response = await ddbClient.send(command);
    console.log(response);
  } catch (err) {
    console.log(err);
    return err;
  }

  // Return the array of items
  return response;
};

/**
 * Sign up with username, password and other attributes like phone, email
 * @param {String | object} params - The user attributes used for signin
 * @param {String[]} restOfAttrs - for the backward compatability
 * @return - A promise resolves callback data if success
 */
export const getItem = async ({
  tableName,
  key,
}: {
  tableName: string;
  key: any;
}) => {
  // Hold the scan results in an array
  let response;
  const command = new GetCommand({
    Key: key,
    TableName: tableName,
  });
  // Perform the operation
  try {
    response = await ddbClient.send(command);
    console.log(response);
  } catch (err) {
    console.log(err);
    return err;
  }

  // Return the array of items
  return response;
};

/**
 * Sign up with username, password and other attributes like phone, email
 * @param {String | object} params - The user attributes used for signin
 * @param {String[]} restOfAttrs - for the backward compatability
 * @return - A promise resolves callback data if success
 */
export const deleteItem = async ({
  tableName,
  key,
}: {
  tableName: string;
  key: any;
}) => {
  // Hold the scan results in an array
  let response;
  const command = new DeleteCommand({
    Key: key,
    TableName: tableName,
  });
  // Perform the operation
  try {
    response = await ddbClient.send(command);
    console.log(response);
  } catch (err) {
    console.log(err);
    return err;
  }

  // Return the array of items
  return response;
};

/**
 * Sign up with username, password and other attributes like phone, email
 * @param {String | object} params - The user attributes used for signin
 * @param {String[]} restOfAttrs - for the backward compatability
 * @return - A promise resolves callback data if success
 */
export const updateItem = async ({
  tableName,
  key,
  expressionAttributeValues,
  updateExpression,
  returnValues = "ALL_NEW",
}: {
  tableName: string;
  key: any;
  expressionAttributeValues: any;
  updateExpression: string;
  returnValues: any;
}) => {
  // Hold the scan results in an array
  let response;
  const command = new UpdateCommand({
    Key: key,
    ExpressionAttributeValues: expressionAttributeValues,
    UpdateExpression: updateExpression,
    ReturnValues: returnValues,
    TableName: tableName,
  });
  // Perform the operation
  try {
    response = await ddbClient.send(command);
    console.log(response);
  } catch (err) {
    console.log(err);
    return err;
  }

  // Return the array of items
  return response;
};

export const hashCode = (s: string) => {
  let h: any;

  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }

  return "" + Math.abs(h);
};

export {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  ddbClient,
  uuidv4
};

