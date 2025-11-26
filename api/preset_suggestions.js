import { getObjectFromS3AsString } from './s3_utils.js'
import { sendEmail } from './email.js';

const sendEmailWithSuggestionData = async (bucketName, suggestionS3Key) => {
    console.log("Retrieving suggestion for bucketName, suggestionS3Key", bucketName, suggestionS3Key);
    const suggestionRawData = await getObjectFromS3AsString(bucketName, suggestionS3Key(suggestionId));
    console.log("Suggestion retrieved, sending email");
    
    await sendEmail({
        "from": {
            "email": "info@birdsongquiz.co.uk",
            "name": "Website visitor"
        },
        "to": [
            {
            "email": "andymccafferty@gmail.com",
            "name": "Me"
            }
        ],
        "subject": "New preset list suggestion",
        "text": `Somebody has suggested the list ${suggestionRawData}`,
        "html": `Somebody has suggested the list ${suggestionRawData}`
    })
    console.log("Email sent")
}

export { sendEmailWithSuggestionData }