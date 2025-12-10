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

export const mockRecordingResponse = (species: string, soundUrl: string) => ({
    "species": species,
    "recording": {
        "id": "737917",
        "gen": "Larus",
        "sp": "marinus",
        "ssp": "",
        "grp": "birds",
        "en": "Great Black-backed Gull",
        "rec": "Alan Dalton",
        "cnt": "Sweden",
        "loc": "Robertsfors Ö, Robertsfors Municipality, Västerbottens län",
        "lat": "63.9403",
        "lon": "20.8029",
        "alt": "0",
        "type": "call, flight call",
        "sex": "uncertain",
        "stage": "adult",
        "method": "field recording",
        "url": "//xeno-canto.org/737917",
        "file": "https://xeno-canto.org/737917/download",
        "file-name": "XC737917-GBBG 15 July 0217.mp3",
        "sono": {
            "small": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/ffts/XC737917-small.png",
            "med": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/ffts/XC737917-med.png",
            "large": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/ffts/XC737917-large.png",
            "full": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/ffts/XC737917-full.png"
        },
        "osci": {
            "small": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/wave/XC737917-small.png",
            "med": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/wave/XC737917-med.png",
            "large": "//xeno-canto.org/sounds/uploaded/BBJSEFYVPV/wave/XC737917-large.png"
        },
        "lic": "//creativecommons.org/licenses/by-nc-sa/4.0/",
        "q": "A",
        "length": "0:21",
        "time": "02:30",
        "date": "2022-07-17",
        "uploaded": "2022-07-17",
        "also": [
            "Sterna paradisaea",
            "Hydrocoloeus minutus"
        ],
        "rmk": "Passive recording with SM4",
        "animal-seen": "no",
        "playback-used": "no",
        "temp": "",
        "regnr": "",
        "auto": "no",
        "dvc": "Wildlife Acoustic SM4",
        "mic": "SM4 inbuilt stereo mics",
        "smp": "24000"
    },
    "soundUrl": soundUrl
})