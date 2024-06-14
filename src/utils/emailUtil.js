import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service:"gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email using the provided email object
 * @param {Object} mailOptions - The email options object
 * @param {string} mailOptions.from - The sender address
 * @param {string} mailOptions.to - The recipient address
 * @param {string} mailOptions.subject - The subject of the email
 * @param {string} mailOptions.text - The plain text body of the email
 * @param {string} mailOptions.html - The HTML body of the email (optional)
 * @returns {Promise} - A Promise that resolves when the email is sent
 */
export function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
}
