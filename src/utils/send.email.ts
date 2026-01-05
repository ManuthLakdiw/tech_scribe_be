import {transporter} from "../config/nodemailer.config";

interface EmailOptions {
    email: string;
    subject: string;
    message?: string;
    html?: string;
}

export const sendEmail = async ({email, subject, message, html}:EmailOptions) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: message,
        html
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log("Email sent successfully")
    }catch (error) {
        console.error("Nodemailer Error:", error);
        throw new Error("Email could not be sent");
    }
}
