const util = require('node:util')
const fs = require('node:fs')
const fsReadFile = util.promisify(fs.readFile)

const os = require('node:os')
const child_process = require('node:child_process')
const childProcessExec = util.promisify(child_process.exec)

const express = require('express')
const cookieSession = require('cookie-session')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(cookieSession({ signed: false }))

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_FILE)
const dbGet = util.promisify(db.get).bind(db)
const dbAll = util.promisify(db.all).bind(db)
const dbExec = util.promisify(db.exec).bind(db)
db.on('trace', console.log)

app.get('/', async (req, res) => {
  const page = req.query.page

  if (!page) {
    res.redirect('/?page=home')
    return
  }

  const _ = {}

  switch (page) {
    case 'home':
      _.output = req.session.output;
      req.session.output = null;

      _.results = await dbAll(`
        SELECT
          MAX(timestamp) AS timestamp,
          hostname,
          ROUND(AVG(round_trip_time), 2) as round_trip_time
        FROM
          results
        GROUP BY
          hostname
        ORDER BY
          timestamp DESC
        LIMIT 10
      `)

      break

    default:
      res.status(404).send('Page not found')

      return
  }

  try {
    const template = await fsReadFile(`./pages/${page}.html`, { encoding: 'utf-8' })
    res.send(eval('`' + template + '`'))
  } catch (err) {
    console.log(err)
    res.status(404).send('Page not found')
  }
})

app.post('/ping', async (req, res) => {
  const hostname = req.body.hostname
  const cmd = `ping -c 4 ${hostname} 2>&1`
  try {
    const { stdout } = await childProcessExec(cmd)
    req.session.output = stdout

    const rtts = Array.from(stdout.matchAll(/time=([\d.]+) ms/g)).map(m => m[1])
    const statements = rtts.map(rtt => `INSERT INTO results(hostname, round_trip_time) VALUES ('${hostname}', ${rtt})`)
    const sql = statements.join(';\n')

    await dbExec(sql)
  } catch (err) {
    req.session.output = err.message
  }
  res.redirect('/?page=home')
})

app.listen(process.env.PORT, async () => {
  const exists = await dbGet(`
    SELECT 1
    FROM sqlite_master
    WHERE type = 'table'
    AND name = 'hosts'
  `)

  if (!exists) {
    const setup = await fsReadFile(process.env.DB_SQL, { encoding: 'utf-8' })
    db.exec(setup)
  }

  console.log(`Server running at http://${os.hostname()}:${process.env.PORT}/`)
})

/*

Server:         10.0.2.3
Address:        10.0.2.3#53

Non-authoritative answer:
Name:   www.google.com
Address: 142.250.188.228
Name:   www.google.com
Address: 2607:f8b0:4007:818::2004
ss
PING www.google.com (142.251.40.36) 56(84) bytes of data.
64 bytes from lax17s55-in-f4.1e100.net (142.251.40.36): icmp_seq=1 ttl=63 time=15.8 ms
64 bytes from lax17s55-in-f4.1e100.net (142.251.40.36): icmp_seq=2 ttl=63 time=14.7 ms
64 bytes from lax17s55-in-f4.1e100.net (142.251.40.36): icmp_seq=3 ttl=63 time=16.3 ms
64 bytes from lax17s55-in-f4.1e100.net (142.251.40.36): icmp_seq=4 ttl=63 time=14.2 ms

--- www.google.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3008ms
rtt min/avg/max/mdev = 14.160/15.234/16.281/0.842 ms
*/