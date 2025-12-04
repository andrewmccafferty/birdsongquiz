import * as https from 'https';

const MAILER_SEND_URL = 'https://api.mailersend.com/v1/email';

export interface SendEmailRequest {
  from: {
    email: string;
    name?: string;
  };
  to: {
    email: string;
    name?: string;
  }[];
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = (sendEmailRequest: SendEmailRequest): Promise<void> => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.MAILER_SEND_API_KEY;
    if (!apiKey) {
      reject(new Error('MAILER_SEND_API_KEY environment variable is not set.'));
      return;
    }

    const body = JSON.stringify(sendEmailRequest);

    const options: https.RequestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const request = https.request(MAILER_SEND_URL, options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Failed to post: status code ${response.statusCode}, response body ${data}`,
            ),
          );
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    // Write POST body
    request.write(body);
    request.end();
  });
};


