import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

export const mockApiGatewayEvent =  (body: unknown = null, 
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null = null): APIGatewayProxyEvent => ({
  body: body ? JSON.stringify(body) : null,
  resource: "/example",
  path: "/example",
  httpMethod: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  multiValueHeaders: {
    "Content-Type": ["application/json"],
  },
  queryStringParameters: queryStringParameters,
  multiValueQueryStringParameters: {
    foo: ["bar"],
  },
  pathParameters: {
    id: "123",
  },
  stageVariables: null,
  requestContext: {
    accountId: "123456789012",
    apiId: "exampleApiId",
    authorizer: {},
    protocol: "HTTP/1.1",
    httpMethod: "GET",
    identity: {
    clientCert: null,
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: "127.0.0.1",
      user: null,
      userAgent: "jest-test",
      userArn: null,
    },
    path: "/example",
    stage: "dev",
    requestId: "test-request-id",
    requestTimeEpoch: Date.now(),
    resourceId: "resourceId",
    resourcePath: "/example",
  },
  isBase64Encoded: false,
});
