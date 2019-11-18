
'use strict'

const bcrypt = require('bcrypt-promise')
const fs = require('fs-extra')
const mime = require('mime-types')
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
			const sql = 'CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR (32) NOT NULL, password VARCHAR (32) NOT NULL, forename VARCHAR (32) NOT NULL, surname VARCHAR (32) NOT NULL, email VARCHAR (50) NOT NULL);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
     * Register an user. This checks for existing entries for a given username
     * @param {String} user - The username of the new user.
     * @param {String} pass - The password of the new user.
     * @param {String} forename - The forename of the new user.
     * @param {String} surname - The surname of the new user.
     * @param {String} email - The email of the new user.
     * @returns {Boolean} True on success, throws an error error on failure
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async register(user, pass, forename, surname, email) {
		try {
			if(user.length === 0) throw new Error('missing username')
			if(pass.length === 0) throw new Error('missing password')
			if(forename.length === 0) throw new Error('missing forename')
			if(surname.length === 0) throw new Error('missing surname')
			if(email.length === 0) throw new Error('missing email')
			let sql = `SELECT COUNT(id) as records FROM user WHERE username="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${user}" already in use`)
			let sql = `SELECT COUNT(id) as records FROM user WHERE email="${email}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`email "${email}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO user(username, password, forename, surname, email) VALUES("${user}", "${pass}", "${forename}", "${surname}", "${email}")`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	/*async uploadPicture(path, mimeType) {
		const extension = mime.extension(mimeType)
		console.log(`path: ${path}`)
		console.log(`extension: ${extension}`)
		//await fs.copy(path, `public/avatars/${username}.${fileExtension}`)
	}*/

	/**
     * Login an user.
     * @param {String} username - The username of the new user.
     * @param {String} password - The password of the new user.
     * @returns {Boolean} True on success, throws an error error on failure
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async login(username, password) {
		try {
			let sql = `SELECT count(id) AS count FROM user WHERE user=name"${username}";`
			const records = await this.db.get(sql)
			if(!records.count) throw new Error(`username "${username}" not found`)
			sql = `SELECT password FROM user WHERE username = "${username}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.password)
			if(valid === false) throw new Error(`invalid password for account "${username}"`)
			return true
		} catch(err) {
			throw err
		}
	}

}

module.exports = {
	User
}