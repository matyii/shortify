const express = require('express')
const fs = require('fs')
const serveIndex = require('serve-index')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))

const config = JSON.parse(fs.readFileSync('./data/config.json'))

app.get("/", (req,res)=>{
    res.render('index')
})

app.post("/", (req,res)=> {
    const hash = crypto.randomBytes(3).toString('hex')
    const originalUrl = req.body['url']
    const shortUrl = `http://${config['domain']}/s/${hash}`

    if (originalUrl === ""){
        res.redirect("/")
    } else {
        fs.readFile("./data/urls.json", (error, data) => {
            if (error) throw error;
            const urls = JSON.parse(data);
            urls[hash] = {};
            urls[hash]["originalUrl"] = originalUrl;
            urls[hash]["shortUrl"] = shortUrl;
    
            fs.writeFile("./data/urls.json", JSON.stringify(urls, null, 2),
              (error2) => {
                if (error2) throw error2;
              }
            );
          });
        res.render('url', {url:shortUrl})
    }
})

app.get("/s/:hash", (req,res) =>{
    const hash = req.params["hash"]
    const urls = JSON.parse(fs.readFileSync('./data/urls.json'))

    if (!urls[hash]) {
        res.redirect("/")
    }
    else {
        res.redirect(urls[hash]['originalUrl'])
    }
})

app.use(express.static("./views/"))
app.use('/assets/', serveIndex('./assets/'))

app.listen(config['port'], () => {
    console.log(`✔️ App listening on URL: ${config['domain']}:${config['port']}`)
})