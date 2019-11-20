
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

describe('create()', () => {

	test('create listing with valid info', async done => {
		expect.assertions(5)
		const listing = await new Listing('exchangebay.db')
		const listing_id = await listing.create(1, 'item_name', 'item_description', 'img_location')
		const data = await listing.getMetadata(listing_id)
		expect(data).toHaveProperty('itemname')
		expect(data).toHaveProperty('itemdescription')
		expect(data).toHaveProperty('imgloc')
		expect(data).toHaveProperty('listerusername')
		expect(data).toHaveProperty('swaplist')
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
		const listing_id = await listing.create(1, 'item_name', '', 'img_location')
		await expect( listing.getMetadata(-1) )
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

})
