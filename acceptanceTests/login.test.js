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
