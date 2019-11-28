
'use strict'

const sqlite = require('sqlite-async')

/**
 * Class that handles listing operations.
 * */
class Listing {

	/**
     * Initialises database and adds 'item' and 'trade' tables if it does not already exist
     * @constructor
     * @param {String} [dbName] - The name of the database. Defaults to :memory:
     * @returns {Listing} New instance of Listing class
     */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS item (item_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, user_id INTEGER REFERENCES user (user_id) NOT NULL, item_name VARCHAR (50) NOT NULL, item_description VARCHAR (250) NOT NULL, item_img_loc VARCHAR (50) NOT NULL); CREATE TABLE IF NOT EXISTS trade (swap_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, buying_id INTEGER REFERENCES item (item_id) NOT NULL, selling_id INTEGER REFERENCES item (item_id) NOT NULL)'
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

	/** Object definition inspired by answer from Dan Dascalescu at https://stackoverflow.com/a/28763616
	 * Metadata object used to render information in listing.handlebars
	 * @typedef {Object} ListingMetadata
	 * @property {Integer} lister_id The lister's User ID
	 * @property {Integer} id The listing ID
	 * @property {String} itemname The item name
	 * @property {String} itemdescription The item description
	 * @property {String} swaplist Comma separated list of items to swap
	 * @property {String} listerusername Username of listing's creator
	 * @property {String} imgloc Location of Listing's image
	 */

	/**
     * Gets the metadata object literal for a given listing
     * @param {Integer} listingId - The ID of the listing/item
     * @returns {ListingMetadata} ListingMetadata object literal
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getMetadata(listingId) {
		try {
			const listingExistsSql = `SELECT COUNT(item_id) as records FROM item WHERE item_id="${listingId}";`
			const data = await this.db.get(listingExistsSql)
			if(data.records === 0) throw new Error(`listing with ID "${listingId}" not found`)
			const sql = `SELECT item_id, user_id, item_name, item_description, item_img_loc FROM item WHERE item_id="${listingId}";`
			const record = await this.db.get(sql)

			const lister = record.user_id

			const item = {
				lister_id: lister,
				id: record.item_id,
				itemname: record.item_name,
				itemdescription: record.item_description,
				imgloc: record.item_img_loc
			}

			const usernameGrabSql = `SELECT username FROM user WHERE user_id="${lister}";`
			const usernameRecord = await this.db.get(usernameGrabSql)

			item.listerusername = usernameRecord.username

			item.swaplist = 'Placeholder, Placeholder Second, Placeholder Third' //Placeholder until I figure out schema

			return item
		} catch(err) {
			throw err
		}
	}

	/**
     * Gets the names of all listings for a given user in an array
     * @param {Integer} User ID
     * @returns {Array} Array of listing names
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getListingNamesFromUserID(userID) {
		try {
			await this.errorIfEmpty(userID.toString(), 'user_id')

			if(isNaN(userID)) {
				throw new Error('non-numeric user id provided')
			}

			const listingExistsSql = `SELECT COUNT(item_id) as records FROM item WHERE user_id="${userID}";`
			const listingData = await this.db.get(listingExistsSql)
			if(listingData.records === 0) return []

			const sql = `SELECT item_name FROM item WHERE user_id="${userID}";`
			const results = []

			const rows = await this.db.all(sql)

			for(let i = 0; i < rows.length; i++) {
				results.push(rows[i].item_name)
			}

			return results

		} catch(err) {
			throw err
		}
	}

	/**
     * Gets the metadata object literal for all listings in an array
     * @returns {Array} Array of ListingMetadata object literals
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getListings() {
		try {
			const listingExistsSql = 'SELECT COUNT(item_id) as records FROM item;'
			const data = await this.db.get(listingExistsSql)
			if(data.records === 0) throw new Error('no listings found')
			const sql = 'SELECT item_id, item_name, item_description, item_img_loc FROM item;'
			const results = []

			const rows = await this.db.all(sql)

			for(let i = 0; i < rows.length; i++) {

				const item = {
					id: rows[i].item_id,
					itemname: rows[i].item_name,
					itemdescription: rows[i].item_description,
					imgloc: rows[i].item_img_loc,
					listerusername: '', //not viewable for logged out users
					swaplist: '' //not viewable for logged out users
				}

				results.push(item)
			}

			return results

		} catch(err) {
			throw err
		}
	}

	/**
     * Creates a listing and returns the listing ID. Does not check if the data is valid
     * @param {Integer} userID - The ID of the listing/item
     * @param {String} itemName - Name of the item being listed
     * @param {String} itemDescription - Description of the item listing
     * @param {String} imgLocation - Relative filepath from webroot to the item image
     * @returns {Integer} ID of new listing
     */
	async create(userID, itemName, itemDescription, imgLocation) {
		try {

			if(isNaN(userID)) {
				throw new Error('non-numeric user_id provided')
			}

			await this.errorIfEmpty(userID.toString(), 'user_id')
			await this.errorIfEmpty(itemName, 'item_name')
			await this.errorIfEmpty(itemDescription, 'item_description')
			await this.errorIfEmpty(imgLocation, 'img_location')

			const sql = `INSERT INTO item (user_id, item_name, item_description, item_img_loc) VALUES (${userID}, '${itemName}', '${itemDescription}', '${imgLocation}');`
			const query = await this.db.run(sql)
			return query.lastID
		} catch(err) {
			throw err
		}
	}

}

module.exports = Listing
