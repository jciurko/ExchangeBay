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

var authorised;
const header = handlebars.compile(fs.readFileSync(`${__dirname}\\views\\partials\\header.handlebars`).toString('utf-8'));
handlebars.registerPartial('header', header);
const footer = handlebars.compile(fs.readFileSync(`${__dirname}\\views\\partials\\footer.handlebars`).toString('utf-8'));
handlebars.registerPartial('footer', footer);
const dPage = handlebars.compile(fs.readFileSync(`${__dirname}\\views\\partials\\default_page.handlebars`).toString('utf-8'));
handlebars.registerPartial('default_page', dPage);
const postLoginHeader = handlebars.compile(fs.readFileSync(`${__dirname}\\views\\partials\\loggedInHeader.handlebars`).toString('utf-8'));
handlebars.registerPartial('postLoginHeader', postLoginHeader);

handlebars.registerHelper('authorised', authorised);




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
        await ctx.render('homepage', { listings: listings, authorised });
    } catch (err) {
        await ctx.render('homepage', { listings: [] });
    }
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The about page.
 *
 * @name About Page
 * @route {GET} /about
 */
router.get('/about', async ctx => await ctx.render('about'))

/**
 * The listing detail page.
 *
 * @name Listing Page
 * @route {GET} /item/{id}
 */
router.get('/item/:id', async ctx => {
    // call the functions in the listing module
    const listing = await new Listing(dbName)

    const parameters = ctx.params
    try {
        const data = await listing.getMetadata(parameters.id)
        await ctx.render('listing', data)
    } catch (err) {
        await ctx.render('homepage', { message: err.message })
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
        // extract the data from the request
        const body = ctx.request.body
        console.log(body)
        const { path, type } = ctx.request.files.avatar
            // call the functions in the module
        const user = await new User(dbName)
        await user.register(body.user, body.pass, body.forename, body.surname, body.email)
            // await user.uploadPicture(path, type)
            // redirect to the home page
        ctx.redirect(`/?msg=new user "${body.name}" added`)
    } catch (err) {
        await ctx.render('error', { message: err.message })
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
    authorised = ctx.session.authorised = null
    if (ctx.query.msg) data.msg = ctx.query.msg
    if (ctx.query.user) data.user = ctx.query.user
    await ctx.render('login', { data, authorised })
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
            const user = await new User(dbName)
            await user.login(body.user, body.pass)
            authorised = ctx.session.authorised = true
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
    authorised = ctx.session.authorised = null
    ctx.redirect('/?msg=you are now logged out')
})

app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))