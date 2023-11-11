/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 *
 */

// Disable automatic export
export { };

// Handler
exports.handler = async (event: any) => {
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
