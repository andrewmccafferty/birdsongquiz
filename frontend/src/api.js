const callApi = async (path) => {
        console.log("Calling API with path: ", path);
        const response = await fetch(`${process.env.API_ROOT}/${path}`);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

export { callApi }