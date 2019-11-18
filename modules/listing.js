
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

	/** Metadata object used to render information in listing.handlebars
	 * @typedef {Object} ListingMetadata
	 * @property {String} itemname The X Coordinate
	 * @property {String} itemdescription The Y Coordinate
	 * @property {String} swaplist Comma separated list of items to swap
	 * @property {String} listerusername Username of listing's creator
	 * @property {String} imgloc Location of Listing's image
	 */

	/**
     * Gets the metadata object literal for a given listing
     * @param {Integer} listing_id - The ID of the listing/item
     * @returns {ListingMetadata} ListingMetadata object literal
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getMetadata(listing_id) {
		try {
			let listing_exists_sql = `SELECT COUNT(item_id) as records FROM item WHERE item_id="${listing_id}";`
			const data = await this.db.get(listing_exists_sql)
			if(data.records == 0) throw new Error(`listing with ID "${listing_id}" not found`)
			let sql = `SELECT user_id, item_name, item_description, item_img_loc FROM item WHERE item_id="${listing_id}";`
			const record = await this.db.get(sql)
			
			let lister = record.user_id

			let item = {
				itemname: record.item_name,
				itemdescription: record.item_description,
				imgloc: record.item_img_loc
			}

			let username_grab_sql = `SELECT username FROM user WHERE user_id="${lister}";`
			const username_record = await this.db.get(username_grab_sql)

			item.listerusername = username_record.username

			item.swaplist = "Placeholder, Placeholder Second, Placeholder Third" //Placeholder until I figure out schema

			return item
		} catch(err) {
			throw err
		}
	}

}

module.exports = Listing