const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'covid19India.db')

const app = express()

app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()
const convertStateObjToResponseObj = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

app.get('/states/', async (request, response) => {
  const getStateQuery = `SELECT * FROM state`
  const stateArray = await db.all(getStateQuery)
  response.send(
    stateArray.map(eachState => convertStateObjToResponseObj(eachState)),
  )
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getState = `SELECT * FROM state WHERE state_id = ${stateId}`
  const stateResponse = await db.get(getState)
  response.send(convertStateObjToResponseObj(stateResponse))
})

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const addDistrictQuery = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths})`
  await db.run(addDistrictQuery)
  response.send('District Successfully Added')
})

module.exports = app
