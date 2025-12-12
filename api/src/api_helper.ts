import * as http from "http";
import * as https from "https";

const getApiJsonData = async <T>(url: string): Promise<T> => {
  console.log("Calling with URL:", url);
  // Tried to do this with fetch, but it didn't work in the Lambda
  // for some reason.
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;

    const request = lib.get(url, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        if (response.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error: unknown) {
            reject(new Error(`Error parsing JSON: ${error}`));
          }
        } else {
          reject(
            new Error(
              `Failed to fetch recording results: status code ${response.statusCode}, response body ${data}`
            )
          );
        }
      });
    });

    request.on("error", (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    request.end();
  });
};

export { getApiJsonData };
