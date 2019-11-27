
'use strict'

const Accounts = require('../modules/user.js')

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register('doej', 'password', 'john', 'doe', 'johndoe@email.com')
		expect(register).toBe(true)
		done()
	})

	test('register a duplicate username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password', 'john', 'doe', 'johndoe@email.com')
		await expect( account.register('doej', 'password', 'john', 'doe', 'johndoe@email.com') )
			.rejects.toEqual( Error('username "doej" already in use') )
		done()
	})

	test('error if blank username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('', 'password') )
			.rejects.toEqual( Error('Username can\'t be empty') )
		done()
	})

	test('error if blank password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect( account.register('doej', '') )
			.rejects.toEqual( Error('Password can\'t be empty') )
		done()
	})

})

describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password', 'john', 'doe', 'johndoe@email.com')
		const valid = await account.login('johndoe@email.com', 'password')
		expect(valid).toBe(true)
		done()
	})

	test('invalid email', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password', 'john', 'doe', 'johndoe@email.com')
		await expect( account.login('johnroe@email.com', 'password') )
			.rejects.toEqual( Error('email "johnroe@email.com" not found') )
		done()
	})

	test('invalid password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password', 'john', 'doe', 'johndoe@email.com')
		await expect( account.login('johndoe@email.com', 'bad') )
			.rejects.toEqual( Error('invalid password for account "johndoe@email.com"') )
		done()
	})

})
