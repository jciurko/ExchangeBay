
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
     * @param {String} [dbName] - The name of the database. Defaults to :memory:
     * @returns {User} New instance of User class
     */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
     * Register an user. This checks for existing entries for a given username
     * @param {String} user - The username of the new user.
     * @param {String} pass - The password of the new user.
     * @returns {Boolean} True on success, throws an error error on failure
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async register(user, pass) {
		try {
			if(user.length === 0) throw new Error('missing username')
			if(pass.length === 0) throw new Error('missing password')
			let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${user}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO users(user, pass) VALUES("${user}", "${pass}")`
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
			let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
			const records = await this.db.get(sql)
			if(!records.count) throw new Error(`username "${username}" not found`)
			sql = `SELECT pass FROM users WHERE user = "${username}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.pass)
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