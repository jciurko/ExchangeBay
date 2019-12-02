#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */

// -- UNUSED MODULE -- \\
const bcrypt = require('bcrypt-promise')

const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({ multipart: true, uploadDir: '.' })
const session = require('koa-session')

// -- Declared but never used -- \\
const sqlite = require('sqlite-async')
const fs = require('fs-extra')
const mime = require('mime-types')
//const jimp = require('jimp')
const handlebars = require('handlebars')

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')
const Listing = require('./modules/listing')
const Nodemailer = require('./modules/nodemailer.js')
const email = 'e005df06c9368fd63@gmail.com'
const pass = '!Q@W#E$R%T'

const app = new Koa()
const router = new Router()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, { map: { handlebars: 'handlebars' } }))

const defaultPort = 8080
const port = process.env.PORT || defaultPort
const dbName = 'exchangebay.db'
const saltRounds = 10

const header = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/header.handlebars`).toString('utf-8'))
handlebars.registerPartial('header', header)
const footer = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/footer.handlebars`).toString('utf-8'))
handlebars.registerPartial('footer', footer)
const dPage = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/default_page.handlebars`).toString('utf-8'))
handlebars.registerPartial('default_page', dPage)
const postLoginHeader = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/loggedInHeader.handlebars`).toString('utf-8'))
handlebars.registerPartial('postLoginHeader', postLoginHeader)

/**
 * The home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
		const listing = await new Listing(dbName)
		const listings = await listing.getListings()
		await ctx.render('homepage', { listings: listings, authorised: ctx.session.authorised })
	} catch (err) {
		await ctx.render('homepage', { listings: [], authorised: ctx.session.authorised })
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register', { authorised: ctx.session.authorised }))

/**
 * The about page.
 *
 * @name About Page
 * @route {GET} /about
 */
router.get('/about', async ctx => await ctx.render('about', { authorised: ctx.session.authorised }))

/**
 * The listing detail page.
 *
 * @name Listing Page
 * @route {GET} /item/{id}
 */
router.get('/item/:id', async ctx => {
	try {
		if (ctx.session.authorised !== true) {
			throw new Error('Only logged in users can view listings.')
		}
		// call the functions in the listing module
		const listing = await new Listing(dbName)

		const usersListings = await listing.getListingNamesFromUserID(ctx.session.user_id)
		const listingData = []
		for (let i = 0; i < usersListings.length; i++) {
			const data = {
				id: i,
				name: usersListings[i]
			}
			listingData.push(data)
		}

		const parameters = ctx.params

		const data = await listing.getMetadata(parameters.id)
		data.ownListings = listingData
		data.authorised = ctx.session.authorised
		await ctx.render('listing', data)
	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}


})

/**
 * The trade offer creation script.
 *
 * @name Trade Offer Script
 * @route {POST} /item/{id}
 */
router.post('/item/:id', async ctx => {
	try {
		if (ctx.session.authorised !== true) {
			throw new Error('Only logged in users can send offers.')
		}
		const itemIndex = ctx.request.body.swapitem

		// call the functions in the listing module
		const listing = await new Listing(dbName)

		const usersListings = await listing.getListingNamesFromUserID(ctx.session.user_id)

		if (itemIndex >= usersListings.length) {
			throw new Error('Invalid trading item selected')
		}

		const selectedTradeItem = usersListings[itemIndex]

		const listingInfo = await listing.getMetadata(ctx.params.id)

		if (listingInfo.lister_id === ctx.session.user_id) {
			throw new Error('Cannot make an offer on an item you own')
		}

		const user = await new User(dbName)

		const listerInfo = await user.getUserDataFromID(listingInfo.lister_id)


		const msg = `Hello ${listerInfo.username},
The user ${ctx.session.username} has offered a trade for one of your item listings!

They wish to trade their '${selectedTradeItem}' for your '${listingInfo.itemname}'.

Your item listing: http://localhost:8080/item/${ctx.params.id}

You can reach them at ${ctx.session.email} in order to discuss this trade further.

Have a great day,
ExchangeBay.`
		const mailer = await new Nodemailer(email, pass)
		await mailer.sendEmailTo(listerInfo.email, `New trade offer for your item '${listingInfo.itemname}'`, msg)

		await ctx.redirect('/?msg=Your trade offer has been sent successfully!')
	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}


})


/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	try {
		const body = ctx.request.body
		const { path, type } = ctx.request.files.avatar
		const user = await new User(dbName)
		await user.register(body.username, body.pass, body.forename, body.surname, body.email)
		await fs.copy(path, `public/avatars/${ctx.session.username}avatar.png`)
		ctx.redirect(`/?msg=new user "${body.username}" added`)
	} catch (err) {
		await ctx.render('error', { message: err.message, authorised: ctx.session.authorised })
	}
})

/**
 * The login page.
 *
 * @name Login Page
 * @route {GET} /login
 */
router.get('/login', async ctx => {
	const data = {}
	if (ctx.query.msg) data.msg = ctx.query.msg
	if (ctx.query.user) data.user = ctx.query.user
	await ctx.render('login', { data, authorised: ctx.session.authorised })
})

/**
 * The script to process user logins.
 *
 * @name Login Script
 * @route {POST} /login
 */
router.post('/login', async ctx => {
	try {
		const body = ctx.request.body
		let userData = await new User(dbName)
		await userData.login(body.email, body.pass)
		ctx.session.authorised = true
		ctx.session.email = body.email
		userData = await userData.getUserData(body.email)
		ctx.session.user_id = parseInt(userData.user_id)
		ctx.session.username = userData.username
		ctx.session.forename = userData.forename
		ctx.session.surname = userData.surname
		return ctx.redirect('/?msg=you are now logged in...')
	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}
})


/**
 * The logout page/script.
 *
 * @name Logout Page
 * @route {GET} /logout
 */
router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.session = null
	ctx.redirect('/?msg=you are now logged out')
})


router.get('/createAnOffer', async ctx => {
	try {
		if (ctx.session.authorised !== true) throw new Error('You must log in')
		await ctx.render('createAnOffer', { authorised: ctx.session.authorised })
	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}
})

router.post('/createAnOffer', koaBody, async ctx => {
	try {
		const body = ctx.request.body
		const itemName = body.item_name

		const { path, type } = ctx.request.files.item_img
		const listing = await new Listing(dbName)
		const filename = `database_images/${ctx.session.username}s${itemName}.png`
		await listing.create(ctx.session.user_id, itemName, body.item_description, filename, body.price)
		await fs.copy(path, `public/${filename}`)

		ctx.redirect(`/?msg=new offer "${itemName}" added`)
	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}
})

router.get('/accountPage', async ctx => {
	try {
		if (ctx.session.authorised !== true) throw new Error('You must log in')
		return ctx.render('accountPage', { authorised: ctx.session.authorised, user_id: ctx.session.user_id, username: ctx.session.username, forename: ctx.session.forename, surname: ctx.session.surname, email: ctx.session.email })

	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}
})

router.get('/search', async ctx => {
	try {

		const listing = await new Listing(dbName)

		const searchResult = await listing.querySearchTerm(ctx.query.searchTerm)
		const items = []
		for (let i = 0; i < searchResult.length; i++) {
			items.push(searchResult[i])
		}
		await ctx.render('search', { authorised: ctx.session.authorised, searchResult: items })
	} catch (err) {
		await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
	}
})

/* TO BE FINISHED

router.get('/restore_pass', async ctx => {
    try {
        await ctx.render('restore_pass')
    } catch (err) {
        await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
    }
})

router.post('/restore_pass', koaBody, async ctx => {
    try {
        const body = ctx.request.body
        let email = body.email
        let subject = 'restore password'
        let message = 'click here to restore password:'
        const mailer = await new Nodeailer(email, pass)
        mailer.sendEmailTo(email, subject, message)

        ctx.redirect(`/?msg=email has been sent"${body.item_name}" added`)
    } catch (err) {
        await ctx.render('error', { authorised: ctx.session.authorised, message: err.message })
    }
})

*/

app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
