
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

	/** Object definition inspired by answer from Dan Dascalescu at https://stackoverflow.com/a/28763616
	 * Metadata object used to render information in listing.handlebars
	 * @typedef {Object} ListingMetadata
	 * @property {Integer} id The listing ID
	 * @property {String} itemname The item name
	 * @property {String} itemdescription The item description
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
			let sql = `SELECT item_id, user_id, item_name, item_description, item_img_loc FROM item WHERE item_id="${listing_id}";`
			const record = await this.db.get(sql)
			
			let lister = record.user_id

			let item = {
				lister_id: lister,
				id: record.item_id,
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

	/**
     * Gets the names of all listings for a given user in an array
     * @param {Integer} User ID
     * @returns {Array} Array of listing names
     * @throws Will throw an error if operation fails and provide descriptive reasoning
     */
	async getListingNamesFromUserID(user_id) {
		try {
			if(user_id == null || user_id == ''){
				throw new Error('no user id provided')
			}else if(isNaN(user_id)){
				throw new Error('non-numeric user id provided')
			}

			let user_exists_sql = `SELECT COUNT(user_id) as records FROM user WHERE user_id="${user_id}";`
			const user_data = await this.db.get(user_exists_sql)
			if(user_data.records == 0) throw new Error(`invalid user id provided`)

			let listing_exists_sql = `SELECT COUNT(item_id) as records FROM item WHERE user_id="${user_id}";`
			const listing_data = await this.db.get(listing_exists_sql)
			if(listing_data.records == 0) {
				return []
			} 

			let sql = `SELECT item_name FROM item WHERE user_id="${user_id}";`
			let results = []

			const rows = await this.db.all(sql)

			for(let i = 0; i < rows.length; i++){
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
			let listing_exists_sql = `SELECT COUNT(item_id) as records FROM item;`
			const data = await this.db.get(listing_exists_sql)
			if(data.records == 0) throw new Error(`no listings found`)
			let sql = `SELECT item_id, item_name, item_description, item_img_loc FROM item;`
			let results = []

			const rows = await this.db.all(sql)

			for(let i = 0; i < rows.length; i++){

				let item = {
					id: rows[i].item_id,
					itemname: rows[i].item_name,
					itemdescription: rows[i].item_description,
					imgloc: rows[i].item_img_loc,
					listerusername: "", //not viewable for logged out users
					swaplist: "" //not viewable for logged out users
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
     * @param {Integer} user_id - The ID of the listing/item
     * @param {String} item_name - Name of the item being listed
     * @param {String} item_description - Description of the item listing
     * @param {String} img_location - Relative filepath from webroot to the item image
     * @returns {Integer} ID of new listing
     */
	async create(user_id, item_name, item_description,  img_location) {
		try {

			if(isNaN(user_id)){
				throw new Error('non-numeric user_id provided')
			}else if(user_id.toString().length == 0){
				throw new Error('no user_id provided')
			}else if(item_name.length == 0){
				throw new Error('no item_name provided')
			}else if(item_description.length == 0){
				throw new Error('no item_description provided')
			}else if(img_location.length == 0){
				throw new Error('no img_location provided')
			}

			let sql = `INSERT INTO item (user_id, item_name, item_description, item_img_loc) VALUES (${user_id}, '${item_name}', '${item_description}', '${img_location}');`
			let query = await this.db.run(sql)
			return query.lastID
		} catch(err) {
			throw err
		}
	}

}

module.exports = Listing