const express = require("express")

const app = express()
const path = require("path")
const http = require("http").Server(app)
const cookieSession = require("cookie-session")
const createError = require('http-errors')
const bodyParser = require('body-parser')
const routes = require('./routes')

const FeedbackService = require('./services/FeedbackService')
const SpeakersService = require('./services/SpeakerService')


const feedbackService = new FeedbackService("./data/feedback.json")
const speakersService = new SpeakersService("./data/speakers.json")

const port = 3000

let server = null

app.set('trust proxy', 1) // without this, cookies might not work on a server

app.use(cookieSession({
    name: 'session',
    keys: ["grlkh4rwlk", "welkjwerwj453k"]
}))

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(path.join(__dirname, './static')))

app.locals.siteName = "ROUX Meetups"

app.use(async (req,res,next) => {
    try {
        const names = await speakersService.getNames()
        res.locals.speakerNames = names
        return next()
    } catch (error) {
        return next(error)
    }
})

app.use('/', routes({
    feedbackService,
    speakersService
}))

app.use((req, res, next) => next(createError(404, "File not found")))

app.use((err, req, res, next) => {
    // console.log(err);
    res.locals.message = err.message
    const status = err.status || 500
    res.locals.status = status
    res.status(status)
    res.render('error')
})

server = http.listen(port, () => {
    console.log(`server is listening on http://localhost:${server.address().port}/`)
})