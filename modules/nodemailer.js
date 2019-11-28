'use strict'
const nodemailer = require('nodemailer')
const sqlite = require('sqlite-async')


class Mailer {

	/**
     * Initialises email information
     * @constructor
     * @param {String} [email] - Email username for SMTP
     * @param {String} [pass] - Password for SMTP
     * @returns {Mailer} New instance of Mailer class
     */
	constructor(email, pass) {
		this.email = email
		this.pass = pass
	}

	/**
     * Sends email to an address
     * @param {String} [recipient] - Email for recipient
     * @param {String} [subject] - Subject for email
     * @param {String} [message] - Message body for email
     */
	async sendEmailTo(recipient, subject, message) {
		try {
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: this.email,
					pass: this.pass,
				}
			})
			const mailOptions = {
				from: this.email,
				to: recipient,
				subject: subject,
				text: message,
			}
			transporter.sendMail(mailOptions, (err, data) => {
				if (err) {
					throw err
				} else {
					console.log('Email sent!')
				}

			})
		} catch (err) {
			throw err
		}
	}
}

module.exports = Mailer
