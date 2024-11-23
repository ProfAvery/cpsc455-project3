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

const yaml = require('yaml')

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

    case 'history':
      const hostname = req.query.hostname
      _.hostname = hostname
      const cmd = `dig +yaml ${hostname} 2>&1`
      const { stdout } = await childProcessExec(cmd)
      const response = yaml.parse(stdout)
      _.answer = response[0].message.response_message_data?.ANSWER_SECTION?.join('\n')
      console.log(_.answer)

      _.history = await dbAll(`
        SELECT
          *
        FROM
          results
        WHERE
          hostname = '${hostname}'
        ORDER BY
          timestamp DESC
        LIMIT 100
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

