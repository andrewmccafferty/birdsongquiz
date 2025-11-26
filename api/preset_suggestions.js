import { getObjectFromS3AsString } from './s3_utils.js'
import { sendEmail } from './email.js';

const sendEmailWithSuggestionData = async (bucketName, suggestionS3Key) => {
    console.log("Retrieving suggestion for bucketName, suggestionS3Key", bucketName, suggestionS3Key);
    const suggestionRawData = await getObjectFromS3AsString(bucketName, suggestionS3Key);
    console.log("Suggestion retrieved, sending email");
    
    await sendEmail({
        "from": {
            "email": process.env.NOTIFICATIONS_FROM_EMAIL_ADDRESS,
            "name": "Website visitor"
        },
        "to": [
            {
            "email": process.env.NOTIFICATIONS_TO_EMAIL_ADDRESS,
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