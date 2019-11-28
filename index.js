#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */
const bcrypt = require('bcrypt-promise')
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({ multipart: true, uploadDir: '.' })
const session = require('koa-session')
const sqlite = require('sqlite-async')
const fs = require('fs-extra')
const mime = require('mime-types')
    //const jimp = require('jimp')
const handlebars = require('handlebars')


/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')
const Listing = require('./modules/listing')
const Nodemailer = require('./modules/nodemailer.js')
const email = 'e005df06c9368fd63@gmail.com';
const pass = '!Q@W#E$R%T';


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

const header = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/header.handlebars`).toString('utf-8'));
handlebars.registerPartial('header', header);
const footer = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/footer.handlebars`).toString('utf-8'));
handlebars.registerPartial('footer', footer);
const dPage = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/default_page.handlebars`).toString('utf-8'));
handlebars.registerPartial('default_page', dPage);
const postLoginHeader = handlebars.compile(fs.readFileSync(`${__dirname}/views/partials/loggedInHeader.handlebars`).toString('utf-8'));
handlebars.registerPartial('postLoginHeader', postLoginHeader);


/**
 * The home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
    try {
        const listing = await new Listing(dbName);
        let listings = await listing.getListings();
        await ctx.render('homepage', { listings: listings, authorised: ctx.session.authorised });
    } catch (err) {
        await ctx.render('homepage', { listings: [], authorised: ctx.session.authorised });
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
    if (ctx.session.authorised !== true) throw new Error('Only logged in users can view listings.');
    // call the functions in the listing module
    const listing = await new Listing(dbName)
    const parameters = ctx.params
    try {
        const data = await listing.getMetadata(parameters.id)
        await ctx.render('listing', data);
    } catch (err) {
        await ctx.render('homepage', { message: err.message, authorised: ctx.session.authorised })
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
        console.log(ctx.request.files.avatar)
        const user = await new User(dbName)
        await user.register(body.username, body.pass, body.forename, body.surname, body.email)
        await fs.copy(path, `public/avatars/${username}avatar.png`)
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
        var userData = await new User(dbName)
        await userData.login(body.email, body.pass)
        ctx.session.authorised = true
        ctx.session.email = body.email
        userData = await userData.getUserData(body.email)
        ctx.session.user_id = parseInt(userData.user_id)
        ctx.session.username = userData.username
        ctx.session.forename = userData.forename
        ctx.session.surname = userData.surname
        console.log(ctx.session)
        return ctx.redirect('/?msg=you are now logged in...')
    } catch (err) {
        await ctx.render('error', { message: err.message })
    }
})


/**
 * The logout page/script.
 *
 * @name Logout Page
 * @route {GET} /logout
 */
router.get('/logout', async ctx => {
    ctx.session.authorised = null;
    ctx.session = null;
    ctx.redirect('/?msg=you are now logged out')
})



router.get('/createAnOffer', async ctx => {
    try {
        if (ctx.session.authorised !== true) throw new Error('You must log in');
        await ctx.render('createAnOffer', { authorised: ctx.session.authorised });
    } catch (err) {
        await ctx.render('error', { message: err.message })
    }
})

router.post('/createAnOffer', koaBody, async ctx => {
    try {
        const body = ctx.request.body
        let item_name = body.item_name

        console.log(body)
        console.log(Object.keys(body))
        const { path, type } = ctx.request.files.item_img
        const listing = await new Listing(dbName)
        const filename = `database_images/${ctx.session.username}s${item_name}.png`
        await listing.create(ctx.session.user_id, item_name, body.item_description, filename)
        await fs.copy(path, `public/${filename}`)

        ctx.redirect(`/?msg=new offer "${body.item_name}" added`)
    } catch (err) {
        await ctx.render('error', { message: err.message })
    }
})

router.get('/accountPage', async ctx => {
    try {
        if (ctx.session.authorised !== true) throw new Error('You must log in');
        return ctx.render('accountPage', { authorised: ctx.session.authorised, user_id: ctx.session.user_id, username: ctx.session.username, forename: ctx.session.forename, surname: ctx.session.surname, email: ctx.session.email });

    } catch (err) {
        await ctx.render('error', { message: err.message })
    }
})

/* TO BE FINISHED

router.get('/restore_pass', async ctx => {
    try {
        await ctx.render('restore_pass')
    } catch (err) {
        await ctx.render('error', { message: err.message })
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
        await ctx.render('error', { message: err.message })
    }
})

*/


app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))