const callApi = async (path) => {
        console.log("Calling API with path: ", path);
        const response = await fetch(`${process.env.API_ROOT}/${path}`);
        const body = await response.json();
        
        if (response.status !== 200) {
            throw Error(`Got status code '${response.status}' and error body '${body.message}' while GETing ${path}`);
        }

        return body;
    };

const postApi = async (path, body) => {
        console.log("POSTing API with path and body", path, body);
        const response = await fetch(`${process.env.API_ROOT}/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const responseBody = await response.json();

        if (response.status !== 200) throw Error(responseBody.message);

        return responseBody;
    };

export { callApi, postApi }