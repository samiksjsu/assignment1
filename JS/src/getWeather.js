"use strict"

const axios = require('axios')
const chalk = require('chalk')
const fs = require('fs');

// default arguments, rest operator
const getWeather = async (latitudes = '37.8267', longitudes = '-122.4233', user = { firstName: 'Samik', lastName: 'Biswas' }, ...args) => {
    try {
        const res = (await axios.get(`https://api.darksky.net/forecast/93973d2448bd32f2d0e84834772a7d62/${latitudes},${longitudes}`)).data

        // object destructuring
        // use of const - the values of const cannot be changed
        const { latitude, longitude, daily } = res

        // spread, JSON.stringify
        fs.writeFile('weather.txt', JSON.stringify({ latitude, longitude, daily, ...user }), (error) => {
            if (error) throw error;
            console.log(chalk.yellowBright('Saved!!!'));
        });

        // use of let - The value will change with each extra argument and also has local scope
        // for (let arg of args) console.log(chalk.redBright(arg))
    } catch (error) {
        console.log(chalk.redBright(error))
    }
}

const getLastWeather = () => {
    try {
        fs.readFile('weather.txt', (error, data) => {
            if (error) throw error;
            const jsonData = JSON.parse(data)
            const { latitude, longitude, firstName, lastName } = jsonData
            console.log(`The location was searched by ${chalk.blueBright(firstName)} ${chalk.blueBright(lastName)} for latitude: ${chalk.cyanBright(latitude)} and longitude: ${chalk.cyanBright(longitude)}`)
        });
    } catch (error) {
        console.log(error)
    }
}

const getMyWeather = (firstName, lastName, ...args) => {

    // JS promises
    axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCodTFr6QoE_rfpdpfUszzwPSrLhTjnNgc').then((data) => {
        const { lat, lng } = data.data.location
        getWeather(lat, lng, { firstName, lastName })
    }).catch((error) => {
        getLastWeather()
    })
}

// exports
module.exports = { getMyWeather }