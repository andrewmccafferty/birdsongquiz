const response = (statusCode, responseBody) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(responseBody),
  });

module.exports.getRecordings = async (event) => {
    console.log('Event: ', event);
    speciesList = event.multiValueQueryStringParameters ? event.multiValueQueryStringParameters["species"] : null;
    if (!speciesList || speciesList.length < 2) {
        return response(400, { "message": "Should include at least 2 species" });
    }
    return response(200, { "species": speciesList });
  }