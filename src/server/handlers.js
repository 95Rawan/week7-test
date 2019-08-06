const { readFile } = require('fs')
const path = require('path')
const qs = require('querystring')
const addCity = require('../database/queries/postData')
const getCities = require('../database/queries/getData')
const getUser = require('../database/queries/getUser')
const addUser = require('../database/queries/addUser')
const { hash, compare } = require('bcrypt')
const { sign, verify } = require('jsonwebtoken')
const alert = require('alert-node')
const cookie = require('cookie')

const serverError = (err, response) => {
  response.writeHead(500, 'Content-Type:text/html')
  response.end('<h1>Sorry, there was a problem loading the homepage</h1>')
  console.log(err)
}

const homeHandler = response => {
  const filepath = path.join(__dirname, '..', '..', 'public', 'index.html')
  readFile(filepath, (err, file) => {
    if (err) return serverError(err, response)
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(file)
  })
}

const citiesHandler = (request, response) => {
  const token = request.headers.cookie
  if (token) {
    const comingToken = cookie.parse(request.headers.cookie).token
    verify(comingToken, process.env.secret, (error, result) => {
      if (error) {
        console.log(error)
      } else if (result) {
        getCities((error, result) => {
          if (error) return serverError(error, response)
          response.writeHead(200, { 'Content-Type': 'Application-json' })
          response.end(result)
        })
      } else {
        alert('Unauthorized access')
        response.writeHead(302, {
          'Content-Type': 'text/html',
          location: '/login'
        })
        response.end()
      }
    })
  } else {
    alert('Unauthorized access')
    response.writeHead(302, {
      'Content-Type': 'text/html',
      location: '/login'
    })
    response.end()
  }
}

const getCitiesHandler = (request, response) => {
  // verify
  const token = request.headers.cookie
  if (token) {
    const comingToken = cookie.parse(request.headers.cookie).token
    verify(comingToken, process.env.secret, (error, result) => {
      if (error) {
        console.log(error)
      } else if (result) {
        const filePath = path.join(__dirname, '..', '..', 'public', 'cities.html')
        readFile(filePath, (err, result) => {
          if (err) return serverError(err, response)
          response.writeHead(200, { 'Content-Type': 'text/html' })
          response.end(result)
        })
      } else {
        alert('Please login first')
        response.writeHead(302, {
          'Content-Type': 'text/html',
          location: '/login'
        })
        response.end()
      }
    })
  } else {
    alert('Please login first')
    response.writeHead(302, {
      'Content-Type': 'text/html',
      location: '/login'
    })
    response.end()
  }
}

const postCityHandler = (request, response) => {
  let data = ''
  request.on('data', chunk => {
    data += chunk
  })
  request.on('end', () => {
    addCity(qs.parse(data), (error, result) => {
      if (error) return serverError(error, response)
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.write('<div style="text-align:center;">')
      response.write('<h2>City Added Succesfuly</h2>')
      response.write('<a href="#" onclick="history.go(-1)"> Click Here to go Back<a/>')
      response.end('</div>')
    })
  })
}

const publicHandler = (url, response) => {
  const filepath = path.join(__dirname, '..', '..', url)
  readFile(filepath, (err, file) => {
    if (err) return serverError(err, response)
    const extension = url.split('.')[1]
    const extensionType = {
      html: 'text/html',
      css: 'text/css'
    }
    response.writeHead(200, { 'content-type': extensionType[extension] })
    response.end(file)
  })
}

const errorHandler = response => {
  response.writeHead(404, { 'content-type': 'text/html' })
  response.end('<h1>404 Page Requested Cannot be Found</h1>')
}

const getSignupPage = response => {
  const filepath = path.join(__dirname, '..', '..', 'public', 'signup.html')
  readFile(filepath, (err, file) => {
    if (err) return serverError(err, response)
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(file)
  })
}

const addUserHandler = (request, response) => {
  let body = ''
  request.on('data', chunck => {
    body += chunck
  })
  request.on('end', () => {
    const { email, password } = qs.parse(body)
    hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.log(hashErr)
        response.writeHead(500)
        response.end('<h1>Error Registering</h1>')
      }
      addUser(email, hashedPassword, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          response.writeHead(302, {
            'Content-Type': 'text/html',
            location: '/login'
          })
          response.end()
        }
      })
    })
  })
}

const getLoginPage = response => {
  const filepath = path.join(__dirname, '..', '..', 'public', 'login.html')
  readFile(filepath, (err, file) => {
    if (err) return serverError(err, response)
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(file)
  })
}

const getUserHandler = (request, response) => {
  let body = ''
  request.on('data', chunck => {
    body += chunck
  })
  request.on('end', () => {
    const loginEmail = qs.parse(body).email
    const loginPassword = qs.parse(body).password

    getUser(loginEmail, (err, hashedPassword) => {
      if (err) {
        response.writeHead(500)
        response.end()
      }
      console.log('hashedPassword', hashedPassword)

      if (hashedPassword.length !== 0) {
        const newpass = hashedPassword[0].password
        compare(loginPassword, newpass, (error, compared) => {
          if (error) {
            response.writeHead(500)
            response.end()
          }
          if (compared) {
            const token = sign(loginEmail, process.env.secret)
            response.writeHead(302, {
              'Content-Type': 'text/html',
              'Set-cookie': 'token=' + token,
              location: '/add-city'
            })
            response.end()
          } else {
            response.writeHead(302, {
              'Content-Type': 'text/html',
              location: '/login'
            })
            alert('Password is not valid')
            response.end()
          }
        })
      } else {
        response.writeHead(302, {
          'Content-Type': 'text/html',
          location: '/login'
        })
        alert('Email does not exist')
        response.end()
      }
    })
  })
}

module.exports = {
  homeHandler,
  getCitiesHandler,
  postCityHandler,
  publicHandler,
  getLoginPage,
  getSignupPage,
  errorHandler,
  addUserHandler,
  getUserHandler,
  citiesHandler
}
