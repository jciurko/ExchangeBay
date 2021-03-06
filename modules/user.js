'use strict'

const bcrypt = require('bcrypt-promise')
const sqlite = require('sqlite-async')
const saltRounds = 10

/**
 * Class that handles user operations.
 * */
class User {

	/**
     * Initialises database and adds 'users' table if it does not already exist
     * @constructor
     * @param {String} [dbName] - The name of the database. Defaults to :memory:
     * @returns {User} New instance of User class
     */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS user \
			(user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR (32) NOT NULL, \
			password VARCHAR (60) NOT NULL, forename VARCHAR (32) NOT NULL, surname VARCHAR (32) NOT NULL, \
			email VARCHAR (50) NOT NULL);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
     * Throws an error including input name if variable is empty
     * @param {Object} input - The username of the new user.
     * @param {String} varName - The password of the new user.
     * @throws Will throw an error if variable is epty and provide contextual name
     */
	async errorIfEmpty(input, varName) {
		if(input === null || input === '' || input.length === 0) {
			throw new Error(`${varName} is empty`)
		}
	}

	/**
     * Register an user. This checks for existing entries for a given username
     * @param {String} username - The username of the new user.
     * @param {String} password - The password of the new user.
     * @param {String} forename - The forename of the new user.
     * @param {String} surname - The surname of the new user.
     * @param {String} email - The email of the new user.
     * @returns {Boolean} True on success, throws an error error on failure
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async register(user, pass, forename, surname, email) {
		try {
			await this.errorIfEmpty(user, 'username')
			await this.errorIfEmpty(pass, 'password')
			await this.errorIfEmpty(forename, 'forename')
			await this.errorIfEmpty(surname, 'surname')
			await this.errorIfEmpty(email, 'email')
			const dataUser = await this.db.get(`SELECT COUNT(user_id) as records FROM user WHERE username="${user}";`)
			if (dataUser.records !== 0) throw new Error(`username "${user}" already in use`)
			const dataEmail = await this.db.get(`SELECT COUNT(user_id) as records FROM user WHERE email="${email}";`)
			if (dataEmail.records !== 0) throw new Error(`email "${email}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			await this.db.run(`INSERT INTO user(username, password, forename, surname, email) \
				VALUES("${user}", "${pass}", "${forename}", "${surname}", "${email}")`)
			return true
		} catch (err) {
			throw err
		}
	}

	/**
     * Login an user.
     * @param {String} email - The email of the user.
     * @param {String} password - The password of the user.
     * @returns {Boolean} True on success, throws an error error on failure
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async login(email, password) {
		try {
			let sql = `SELECT count(user_id) AS count FROM user WHERE email="${email}";`
			const records = await this.db.get(sql)
			if (!records.count) throw new Error(`email "${email}" not found`)
			sql = `SELECT password FROM user WHERE email= "${email}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.password)
			if (valid === false) throw new Error(`invalid password for account "${email}"`)
			return true
		} catch (err) {
			throw err
		}
	}


	/**
     * Get all database information for an user.
     * @param {String} email - The email of the user.
     * @returns {Array} Array of user data for the given email
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getUserData(email) {
		try {
			const sql = `SELECT * FROM user WHERE email= "${email}";`
			const record = await this.db.get(sql)
			return record
		} catch (err) {
			throw err
		}
	}

	/**
     * Get all database information for an user from an user_id.
     * @param {Integer} user_id - The user_id of the user.
     * @returns {Array} Array of user data for the given email
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getUserDataFromID(userId) {
		try {
			if(isNaN(userId)) {
				throw new Error('non-numeric id provided')
			}
			const existsCheck = `SELECT count(user_id) AS count FROM user WHERE user_id="${userId}";`
			const existsRecords = await this.db.get(existsCheck)
			if (!existsRecords.count) throw new Error(`user with id "${userId}" not found`)
			const sql = `SELECT * FROM user WHERE user_id="${userId}";`
			const record = await this.db.get(sql)
			return record
		} catch (err) {
			throw err
		}
	}

	async tearDown() {
		await this.db.close()
	}
}
module.exports = User
