import { getObjectFromS3AsString } from './s3_utils.js'
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const sendEmailWithSuggestionData = async (bucketName, suggestionS3Key) => {
    console.log("Retrieving suggestion for bucketName, suggestionS3Key", bucketName, suggestionS3Key);
    const suggestionRawData = await getObjectFromS3AsString(bucketName, suggestionS3Key(suggestionId));
    console.log("Suggestion retrieved, sending email")
    const mailerSend = new MailerSend({
        apiKey: process.env.MAILER_SEND_API_KEY,
    });

    const emailParams = new EmailParams()
        .setFrom(new Sender("info@birdsongquiz.co.uk", "Test sender"))
        .setTo([new Recipient("andymccafferty@gmail.com", "Test receipient")])
        .setSubject("New preset list suggestion")
        .setHtml(`Somebody has suggested the list ${suggestionRawData}`)
        .setText(`Somebody has suggested the list ${suggestionRawData}`);

    await mailerSend.email.send(emailParams);
    console.log("Email sent")
}

export { sendEmailWithSuggestionData }