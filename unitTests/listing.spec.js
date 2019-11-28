
'use strict'

const Listing = require('../modules/listing.js')

describe('getMetadata()', () => {

	test('get data from a valid listing', async done => {
		expect.assertions(7)
		const listing = await new Listing('exchangebay.db')
		const data = await listing.getMetadata(1)
		expect(data).toHaveProperty('lister_id')
		expect(data).toHaveProperty('id')
		expect(data).toHaveProperty('itemname')
		expect(data).toHaveProperty('itemdescription')
		expect(data).toHaveProperty('imgloc')
		expect(data).toHaveProperty('listerusername')
		expect(data).toHaveProperty('swaplist')
		done()
	})

	test('get data from an invalid listing', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.getMetadata(-1) )
			.rejects.toEqual( Error('listing with ID "-1" not found') )
		done()
	})

	test('error if blank listing_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.getMetadata('') )
			.rejects.toEqual( Error('listing with ID "" not found') )
		done()
	})

	test('error with non-numeric listing_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.getMetadata('test') )
			.rejects.toEqual( Error('listing with ID "test" not found') )
		done()
	})

})

describe('getListingNamesFromUserID()', () => {

	test('get names from a valid user id', async done => {
		expect.assertions(2)
		const listing = await new Listing('exchangebay.db')
		const data = await listing.getListingNamesFromUserID(1)
		expect(data).toBeInstanceOf(Array)
		expect(data.length).toBeGreaterThanOrEqual(0)
		done()
	})

	test('get names from an invalid user id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.getListingNamesFromUserID(-1) )
			.rejects.toEqual( Error('invalid user id provided') )
		done()
	})

	test('get names from a blank user id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.getListingNamesFromUserID('') )
			.rejects.toEqual( Error('no user id provided') )
		done()
	})

	test('error with non-numeric user id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.getListingNamesFromUserID('test') )
			.rejects.toEqual( Error('non-numeric user id provided') )
		done()
	})

	test('user with no listings', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		const listings = listing.getListingNamesFromUserID(9)
		expect(listings.length).toEqual(undefined)
		done()
	})


})

describe('create()', () => {

	test('create listing with valid info', async done => {
		expect.assertions(6)
		const listing = await new Listing('exchangebay.db')
		const listing_id = await listing.create(1, 'item_name', 'item_description', 'img_location')

		const data = await listing.getMetadata(listing_id)
		expect(data).toHaveProperty('id')
		expect(data).toHaveProperty('itemname')
		expect(data).toHaveProperty('itemdescription')
		expect(data).toHaveProperty('imgloc')
		expect(data).toHaveProperty('listerusername')
		expect(data).toHaveProperty('swaplist')
		done()
			
	})

	test('create listing with no user_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.create('', 'item_name', 'item_description', 'img_location') )
			.rejects.toEqual( Error('no user_id provided') )
		done()
	})

	test('create listing with no item_name', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.create(1, '', 'item_description', 'img_location') )
			.rejects.toEqual( Error('no item_name provided') )
		done()
	})

	test('create listing with no item_description', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.create(1, 'item_name', '', 'img_location') )
			.rejects.toEqual( Error('no item_description provided') )
		done()
	})

	test('create listing with no img_location', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.create(1, 'item_name', 'item_description', '') )
			.rejects.toEqual( Error('no img_location provided') )
		done()
	})

	test('create listing with non-numeric user_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		await expect( listing.create('test', 'item_name', 'item_description', 'img_location') )
			.rejects.toEqual( Error('non-numeric user_id provided') )
		done()
	})

})

describe('getListings()', () => {

	test('get listings returns not null', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		const all_listings = await listing.getListings()
		expect(all_listings).not.toBeNull()
		done()
	})

	test('get listings returns array', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		const all_listings = await listing.getListings()
		expect(all_listings).toBeInstanceOf(Array)
		done()
	})

	test('get listings returns array with more than 0 elements', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		const all_listings = await listing.getListings()
		expect(all_listings.length).toBeGreaterThanOrEqual(0)
		done()
	})

	test('get listings returns valid listings', async done => {
		const listing = await new Listing('exchangebay.db')
		const all_listings = await listing.getListings()
		expect.assertions(1 + (all_listings.length * 6))
		expect(all_listings).toBeInstanceOf(Array)
		for(let i = 0; i < all_listings.length; i++){
			expect(all_listings[i]).toHaveProperty('id')
			expect(all_listings[i]).toHaveProperty('itemname')
			expect(all_listings[i]).toHaveProperty('itemdescription')
			expect(all_listings[i]).toHaveProperty('imgloc')
			expect(all_listings[i]).toHaveProperty('listerusername')
			expect(all_listings[i]).toHaveProperty('swaplist')
		}
		done()
	})

	test('no listings found', async done => {
		expect.assertions(1)
		const listing = await new Listing()
		await expect( listing.getListings() )
			.rejects.toEqual( Error('no listings found') )
		done()
	})

})
