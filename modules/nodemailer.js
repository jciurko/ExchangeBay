'use strict'
const nodemailer = require('nodemailer')
const sqlite = require('sqlite-async')


class Mailer {

    /**
     * Initialises database and adds 'users' table if it does not already exist
     * @constructor
     * @param {String} [dbName] - The name of the database. Defaults to :memory:
     * @returns {User} New instance of User class
     */
    constructor(email, pass) {
        this.email = email;
        this.pass = pass;
    }

    async sendEmailTo(recipient, subject, message) {
        try {
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: this.email,
                    pass: this.page,
                }
            });
            let mailOptions = {
                from: this.email,
                to: recipient,
                subject: subject,
                text: message,
            };
            transporter.sendMail(mailOptions, function(err, data) {
                if (err) {
                    throw new Error('Username can\'t be empty')
                } else {
                    console.log('Email sent!')
                }

            });
        } catch (err) {
            throw err
        }
    }
}