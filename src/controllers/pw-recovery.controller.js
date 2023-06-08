import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
   service: 'gmail',
   port: 587,
   secure: false,
   auth: {
      user: 'federicomatiasrios@gmail.com',
      pass: 'clnyopbalcelarjv'
   }
});

export function generatePasswordRecoveryToken() {
   return new Promise((resolve, reject) => {
      crypto.randomBytes(20, (err, buffer) => {
         if (err) {
            reject(err);
         } else {
            const token = buffer.toString('hex');
            resolve(token);
         }
      });
   });
}

export async function sendPasswordRecoveryEmail(email, subject, body) {
   try {
      // Compose the email options
      const mailOptions = {
         to: email,
         subject: subject,
         text: body
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Password recovery email sent successfully');
   } catch (error) {
      console.error('Error sending password recovery email:', error);
   }
}