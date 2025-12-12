import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: "eu-west-2" });

const invokeLambda = async (functionName: string, payload: unknown) => {
  if (!functionName) {
    throw new Error(
      "functionName parameter not set when trying to call Lambda"
    );
  }
  const command = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  const response = await lambda.send(command);

  // Lambda returned an internal error
  if (response.FunctionError) {
    const errorPayload = new TextDecoder("utf-8").decode(response.Payload);
    let errorMessage = errorPayload;

    try {
      // Attempt to parse JSON if it's structured error info
      const parsed = JSON.parse(errorPayload);
      errorMessage = parsed.errorMessage || errorPayload;
    } catch (_) {
      // If it's not JSON, keep raw text
    }

    throw new Error(`Lambda error: ${errorMessage}`);
  }

  // Non-200 status code (invocation issue)
  if (response.StatusCode !== 200) {
    throw new Error(
      `Lambda invocation failed with status ${response.StatusCode}`
    );
  }
};

export { invokeLambda };
