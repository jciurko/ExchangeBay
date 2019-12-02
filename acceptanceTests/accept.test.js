/* Inspired by template */
'use strict'

const puppeteer = require('puppeteer')
const { configureToMatchImageSnapshot } = require('jest-image-snapshot')
const shell = require('shelljs')

const width = 800
const height = 600
const delayMS = 5

let browser
let page

// threshold is the difference in pixels before the snapshots dont match
const toMatchImageSnapshot = configureToMatchImageSnapshot({
	customDiffConfig: { threshold: 2 },
	noColors: true,
})
expect.extend({ toMatchImageSnapshot })

beforeAll( async() => {
	browser = await puppeteer.launch({ headless: true, slowMo: delayMS, args: [`--window-size=${width},${height}`] })
	page = await browser.newPage()
	await page.setViewport({ width, height })
	await shell.exec('acceptanceTests/scripts/beforeAll.sh')
})

afterAll( async() => {
	browser.close()
	await shell.exec('acceptanceTests/scripts/afterAll.sh')
})

beforeEach(async() => {
	await shell.exec('acceptanceTests/scripts/beforeEach.sh')
})

describe('Registering and logging in', () => {
	test('Register a user and then log in', async done => {
		expect.assertions(2)
		//ARRANGE
		await page.goto('http://localhost:8080/register', { timeout: 30000, waitUntil: 'load' })
		//ACT
		await page.type('input[name=username]', 'NewUser')
		await page.type('input[name=forename]', 'FirstName')
		await page.type('input[name=surname]', 'Surname')
		await page.type('input[name=pass]', 'password')
		await page.type('input[name=email]', 'new.user@me.com')
		await page.click('input[value=Create]')
		await page.goto('http://localhost:8080/login', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=email]', 'new.user@me.com')
		await page.type('input[name=pass]', 'password')
		await page.click('input[value=Login]')
		//ASSERT
		//check that the user is taken to the homepage after attempting to login as the new user:
		await page.waitForSelector('.msg')
		expect( await page.evaluate( () => document.querySelector('.msg').innerText ) )
			.toBe('You are now logged in...')

		// grab a screenshot
		const image = await page.screenshot()
		// compare to the screenshot from the previous test run
		expect(image).toMatchImageSnapshot()
		done()
	}, 16000)
})

describe('Account Overview Page', () => {
	expect.assertions(6)
	test('Register a user, log in and then verify account info is correct', async done => {
		//ARRANGE
		await page.goto('http://localhost:8080/register', { timeout: 30000, waitUntil: 'load' })
		//ACT
		await page.type('input[name=username]', 'NewUser')
		await page.type('input[name=forename]', 'FirstName')
		await page.type('input[name=surname]', 'Surname')
		await page.type('input[name=pass]', 'password')
		await page.type('input[name=email]', 'new.user@me.com')
		await page.click('input[value=Create]')
		await page.goto('http://localhost:8080/login', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=email]', 'new.user@me.com')
		await page.type('input[name=pass]', 'password')
		await page.click('input[value=Login]')
		await page.goto('http://localhost:8080/accountPage', { timeout: 30000, waitUntil: 'load' })
		//ASSERT
		//check that info on account page is correct:
		await page.waitForSelector('.B')
		expect( await page.evaluate( () => document.querySelectorAll('li')[0].innerText ) )
			.toBe('User Id: 1')
		expect( await page.evaluate( () => document.querySelectorAll('li')[1].innerText ) )
			.toBe('User name: NewUser')
		expect( await page.evaluate( () => document.querySelectorAll('li')[2].innerText ) )
			.toBe('Forename: FirstName')
		expect( await page.evaluate( () => document.querySelectorAll('li')[3].innerText ) )
			.toBe('Surname: Surname')
		expect( await page.evaluate( () => document.querySelectorAll('li')[4].innerText ) )
			.toBe('Email Address: new.user@me.com')
		// grab a screenshot
		const image = await page.screenshot()
		// compare to the screenshot from the previous test run
		expect(image).toMatchImageSnapshot()
		done()
	}, 16000)
})

describe('Listing creation', () => {
	test('Create listing and verify listing page', async done => {
		expect.assertions(4)
		//ARRANGE
		await page.goto('http://localhost:8080/register', { timeout: 30000, waitUntil: 'load' })
		//ACT
		await page.type('input[name=username]', 'NewUser')
		await page.type('input[name=forename]', 'FirstName')
		await page.type('input[name=surname]', 'Surname')
		await page.type('input[name=pass]', 'password')
		await page.type('input[name=email]', 'new.user@me.com')
		await page.click('input[value=Create]')
		await page.goto('http://localhost:8080/login', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=email]', 'new.user@me.com')
		await page.type('input[name=pass]', 'password')
		await page.click('input[value=Login]')
		await page.goto('http://localhost:8080/createAnOffer', { timeout: 30000, waitUntil: 'load' })
		await page.type('input[name=item_name]', 'Test Listing')
		await page.type('textarea[name=item_description]', 'Description for Test Listing')
		await page.type('input[name=price]', 'Swap, List')
		await page.click('input[value=Create]')
		await page.goto('http://localhost:8080/item/1', { timeout: 30000, waitUntil: 'load' })
		//ASSERT
		//check all listing info is correct
		expect( await page.evaluate( () => document.querySelector('section.item-details h1').innerText ) )
			.toBe('Test Listing')
		expect( await page.evaluate( () => document.querySelector('section.item-details p').innerText ) )
			.toBe('Description for Test ListingDescribe your item here')
		expect( await page.evaluate( () => document.querySelectorAll('section.item-details p')[1].innerText ) )
			.toBe('NewUser will swap this for: Swap, List')

		// grab a screenshot
		const image = await page.screenshot()
		// compare to the screenshot from the previous test run
		expect(image).toMatchImageSnapshot()
		done()
	}, 25000)
})
