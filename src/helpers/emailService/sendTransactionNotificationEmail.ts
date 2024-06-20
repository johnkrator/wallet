import nodemailer, {Transporter, SendMailOptions} from "nodemailer";
import * as process from "node:process";

type TransactionType = "deposit" | "withdrawal" | "transfer";

interface TransactionDetails {
    type: TransactionType;
    amount: number;
    recipientEmail?: string;
    balance?: number;
}

const sendTransactionNotificationEmail = async (email: string, transaction: TransactionDetails): Promise<void> => {
    let transporter: Transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let subject: string;
    let text: string;

    switch (transaction.type) {
        case "deposit":
            subject = "Deposit Confirmation";
            text = `Your deposit of $${transaction.amount} was successful. Your new balance is $${transaction.balance}.`;
            break;
        case "withdrawal":
            subject = "Withdrawal Confirmation";
            text = `Your withdrawal of $${transaction.amount} was successful. Your new balance is $${transaction.balance}.`;
            break;
        case "transfer":
            subject = "Transfer Confirmation";
            text = `Your transfer of $${transaction.amount} to ${transaction.recipientEmail} was successful. Your new balance is $${transaction.balance}.`;
            break;
    }

    let message: SendMailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        text: text,
    };

    try {
        let info = await transporter.sendMail(message);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error(error);
    }
};

export default sendTransactionNotificationEmail;
