export const callApi = async <T = object>(path: string): Promise<T> => {
  console.log('Calling API with path: ', path);
  const response = await fetch(`${process.env.API_ROOT}/${path}`);
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(
      `Got status code '${response.status}' and error body '${body.message}' while GETing ${path}`,
    );
  }

  return body as T;
};

export const postApi = async <TRequest extends object, TResponse = object>(
  path: string,
  body: TRequest,
): Promise<TResponse> => {
  console.log('POSTing API with path and body', path, body);
  const response = await fetch(`${process.env.API_ROOT}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const responseBody = await response.json();

  if (response.status !== 200) throw Error(responseBody.message);

  return responseBody as TResponse;
};


