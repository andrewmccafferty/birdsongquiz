const callApi = async (path) => {
        // TODO: if this API remains stable, switch back to the domain name
        //const API_ROOT = "https://api.birdsongquiz.co.uk"
        const API_ROOT = "https://asry9syqi9.execute-api.eu-west-2.amazonaws.com/prod"
        console.log("Calling API with path: ", path);
        const response = await fetch(`${API_ROOT}/${path}`);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

export { callApi }