
'use strict'

const Listing = require('../modules/listing.js')

describe('getMetadata()', () => {

	test('get data from a valid listing', async done => {
		expect.assertions(5)
		const listing = await new Listing('exchangebay.db')
		const data = await listing.getMetadata(1)
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

describe('getListings()', () => {

	test('get listings returns not null', async done => {
		expect.assertions(1)
		const listing = await new Listing('exchangebay.db')
		const all_listings = await listing.getListings()
		expect(all_listings).not().toBeNull()
		done()
	})

	test('get listings returns array', async done => {
		expect.assertions(2)
		const listing = await new Listing('exchangebay.db')
		const all_listings = await listing.getListings()
		expect(all_listings).toBeInstanceOf(Array)
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
