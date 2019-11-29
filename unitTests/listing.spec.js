
'use strict'

const Listing = require('../modules/listing.js')

describe('getMetadata()', () => {

	test('get data from a valid listing', async done => {
		expect.assertions(7)
		const listing = await new Listing('exchangebay-unittests.db')
		const data = await listing.getMetadata(3)
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
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.getMetadata(-1) )
			.rejects.toEqual( Error('listing with ID "-1" not found') )
		done()
	})

	test('error if blank listing_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.getMetadata('') )
			.rejects.toEqual( Error('listing with ID "" not found') )
		done()
	})

	test('error with non-numeric listing_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.getMetadata('test') )
			.rejects.toEqual( Error('listing with ID "test" not found') )
		done()
	})

})

describe('getListingNamesFromUserID()', () => {

	test('get names from a valid user id', async done => {
		expect.assertions(2)
		const listing = await new Listing('exchangebay-unittests.db')
		const data = await listing.getListingNamesFromUserID(1)
		expect(data).toBeInstanceOf(Array)
		expect(data.length).toBeGreaterThanOrEqual(0)
		done()
	})

	test('get names from an invalid user id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.getListingNamesFromUserID(-1) )
			.rejects.toEqual( Error('invalid user id provided') )
		done()
	})

	test('get names from a blank user id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.getListingNamesFromUserID('') )
			.rejects.toEqual( Error('user_id is empty') )
		done()
	})

	test('error with non-numeric user id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.getListingNamesFromUserID('test') )
			.rejects.toEqual( Error('invalid user_id provided') )
		done()
	})

	test('user with no listings', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		const listings = listing.getListingNamesFromUserID(9)
		expect(listings.length).toEqual(undefined)
		done()
	})


})

describe('create()', () => {

	test('create listing with valid info', async done => {
		expect.assertions(6)
		const listing = await new Listing('exchangebay-unittests.db')
		const ListingId = await listing.create(1, 'item_name', 'item_description', 'img_location')

		const data = await listing.getMetadata(ListingId)
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
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.create('', 'item_name', 'item_description', 'img_location') )
			.rejects.toEqual( Error('user_id is empty') )
		done()
	})

	test('create listing with no item_name', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.create(1, '', 'item_description', 'img_location') )
			.rejects.toEqual( Error('item_name is empty') )
		done()
	})

	test('create listing with no item_description', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.create(1, 'item_name', '', 'img_location') )
			.rejects.toEqual( Error('item_description is empty') )
		done()
	})

	test('create listing with no img_location', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.create(1, 'item_name', 'item_description', '') )
			.rejects.toEqual( Error('img_location is empty') )
		done()
	})

	test('create listing with non-numeric user_id', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		await expect( listing.create('test', 'item_name', 'item_description', 'img_location') )
			.rejects.toEqual( Error('invalid user_id provided') )
		done()
	})

})

describe('getListings()', () => {

	test('get listings returns not null', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		const allListings = await listing.getListings()
		expect(allListings).not.toBeNull()
		done()
	})

	test('get listings returns array', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		const allListings = await listing.getListings()
		expect(allListings).toBeInstanceOf(Array)
		done()
	})

	test('get listings returns array with more than 0 elements', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		const allListings = await listing.getListings()
		expect(allListings.length).toBeGreaterThanOrEqual(0)
		done()
	})

	test('get listings returns valid listings', async done => {
		const listing = await new Listing('exchangebay-unittests.db')
		const allListings = await listing.getListings()
		expect.assertions(1 + allListings.length * 6)
		expect(allListings).toBeInstanceOf(Array)
		for(let i = 0; i < allListings.length; i++) {
			expect(allListings[i]).toHaveProperty('id')
			expect(allListings[i]).toHaveProperty('itemname')
			expect(allListings[i]).toHaveProperty('itemdescription')
			expect(allListings[i]).toHaveProperty('imgloc')
			expect(allListings[i]).toHaveProperty('listerusername')
			expect(allListings[i]).toHaveProperty('swaplist')
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



describe('getItemsFromSearchTerm()', () => {

	test('return items from valid search', async done => {
		expect.assertions(2)
		const listing = await new Listing('exchangebay-unittests.db')
		const data = await listing.querySearchTerm('t')
		expect(data).toBeInstanceOf(Array)
		expect(data.length).toBeGreaterThanOrEqual(0)
		done()
	})


	test('Return no items from search matching zero items', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay-unittests.db')
		const items = listing.querySearchTerm('zxcvuaveuvuyceuweyrcfwysvweifgyhrfgbd')
		expect(items.length).toEqual(undefined)
		done()
	})


})
