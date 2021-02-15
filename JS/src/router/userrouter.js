const { sequelize, DataTypes, Sequelize } = require('../db/conn')
const express = require('express')
const User = require("../dbmodels/user")
const bcrypt = require('bcrypt')
const multer = require('multer')
const sharp = require('sharp')
const axios = require('axios')
const Garage = require("../dbmodels/garage")
const VehicleType = require('../dbmodels/vehicle_type')
const Booking = require('../dbmodels/booking')
const UserMembership = require('../dbmodels/user_membership')
const MembershipFee = require('../dbmodels/membership_fee')
const Car = require('../dbmodels/car')
const moment = require('moment')
const stripe = require('stripe')("")
const router = new express.Router()
const { QueryTypes } = require('sequelize')

const result = {
    "flag": "",
    "message": ""
}
router.post('/healthCheck', (req,res) => {
	res.status(200).send('OK');
})

router.post('/userlogin', async (req, res) => {
    console.log(req.body)
    try {
        let user = await User.findByPk(req.body.u_email_id)
        if (user === null) {
            result.flag = 'F'
            result.message = "Please register and then login"
            res.status(201).send(result)
        } else {
            user = user.dataValues
            const checkPassword = await bcrypt.compare(req.body.u_password, user.u_password)
            console.log(checkPassword)
            if (checkPassword === true || req.body.u_password === 'Google Login') {
                result.flag = 'S'
                result.message = "Login successful"
                delete user.password
                result.user = user
                res.status(201).send(result)
            } else {
                result.flag = 'F'
                result.message = "Please enter correct password"
                result.user = user
                res.status(201).send(result)
            }

        }
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

const upload = multer({

})

router.post('/profile', upload.single('DriversLicense'), async (req, res, next) => {


    const buffer = await (await sharp(req.file.buffer).toBuffer()).toString('base64')
    console.log(buffer)
    res.set('Content-Type', 'image/jpg')

    const user = JSON.parse(req.body.details)
    console.log(user)
    //Getting the img and converting it to String


    try {
        // Check if user is already present
        let u = await User.findOne({
            where: {
                u_email_id: user.u_email_id
            }
        });
        // If user is not already present hash the password, and return success message
        if (u === null) {

            user.u_password = await bcrypt.hash(user.u_password, 10)
            user.u_driver_license_photo = buffer
            await User.create(user)
            result.flag = 'S'
            result.message = "User successfuly created"
            res.status(201).send(result)
        }// If user is  already present hash the password, and return faliure message
        else {
            result.flag = 'F'
            result.message = "User already present"
            res.status(201).send(result)
        }

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/signup', async (req, res) => {

    try {
        // Check if user is already present
        let user = await User.findOne({
            where: {
                u_email_id: req.body.u_email_id
            }
        });
        // If user is not already present hash the password, and return success message
        if (user === null) {
            req.body.u_password = await bcrypt.hash(req.body.u_password, 10)
            await User.create(req.body)
            result.flag = 'S'
            result.message = "User successfuly created"
            res.status(201).send(result)
        }// If user is  already present hash the password, and return faliure message
        else {
            result.flag = 'F'
            result.message = "User already present"
            res.status(201).send(result)
        }

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/getCityFromState', async (req, res) => {

    try {
        console.log(req.body)
        const data = await Garage.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('g_city')), 'g_city']
            ],
            where: {
                g_state: req.body.g_state
            }
        });
        result.flag = 'S'
        result.message = "Garage found successfully"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/getGarageFromCity', async (req, res) => {

    try {
        const data = await Garage.findAll({
            // attributes:[
            //     [Sequelize.fn('DISTINCT', Sequelize.col('g_id', 'g_name'))]
            // ],
            where: {
                g_city: req.body.g_city,
                g_state: req.body.g_state
            }
        });
        result.flag = 'S'
        result.message = "Garage found successfully"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/searchCar', async (req, res) => {


    try {

        const garage_id = req.body.g_id
        const booking_start_date = req.body.b_date_from
        const booking_end_date = req.body.b_date_to
        const booking_start_time = req.body.b_time_from
        const booking_end_time = req.body.b_time_to
        
        const carList = await sequelize.query("select * from car where c_registration_number not in (select b_car_registration_number from booking where (b_date_from ='" + booking_start_date + "' or b_date_to = '" + booking_start_date + "') and ((b_time_from between '" + booking_start_time +"' and '" + booking_end_time +"') or (b_time_to between '" + booking_start_time + "' and '" + booking_end_time + "')) and b_status != 'Cancelled') and c_registration_number not in (select b_car_registration_number from booking where (b_date_from = '" + booking_end_date + "' or b_date_to = '" + booking_end_date + "') and ((b_time_from between '" + booking_start_time +"' and '" + booking_end_time + "') or (b_time_to between '" + booking_start_time + "' and '" + booking_end_time + "')) and b_status != 'Cancelled') and c_location = " + garage_id + " and c_status != 'Blocked'", { type: QueryTypes.SELECT })

        result.flag = 'S'
        result.message = "Car type created successfuly"
        res.status(201).send(carList)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/getCarPhoto', async (req, res) => {
    try {
        const carPhoto = await Car.findAll({
            where: {
                c_registration_number: req.body.c_registration_number
            }
        });

        res.set('Content-Type', 'image/png')
        res.send(carPhoto[0].dataValues.c_car_photo)

    } catch (e) {
        res.status(404).send()
    }
})

router.get('/getCarTypes', async (req, res) => {
    try {
        const rates = await VehicleType.findAll()

        res.send(rates)
    } catch (e) {

    }
})

router.get('/getCarType/:vt_name', async (req, res) => {
    try {
        console.log(req.params.vt_name)
        const rate = await VehicleType.findByPk(req.params.vt_name)

        res.send(rate)
    } catch (e) {

    }
})

router.post('/bookCar', async (req, res) => {
    try {

        console.log(req.body)

        await Booking.create(req.body, {
            fields: ['b_date_from', 'b_date_to', 'b_time_from', 'b_time_to',
                'b_garage_from', 'b_garage_to', 'b_car_registration_number',
                'b_user_driver_license', 'b_status', 'b_payment'],
        })

        result.flag = 'S'
        result.message = "Booking Successful"
        res.status(201).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/checkout', async (req, res, next) => {
    let error
    let status
    try {
        console.log(req.body)
        const { product, token } = req.body
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        })
        let final_charge
        const charge = await stripe.charges.create(
            {
                amount: product.price * 100,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: "Stripe payment",

            },
            function (err, charge) {
                // asynchronously called
                status = "success"
                final_charge = charge
                res.send({ error, status, final_charge })
            }
        )


    }
    catch (e) {
        console.log(e)
        status = "failure"
        res.send({ error, status })
    }

})

router.get('/getUpcomingRides/:data', async (req, res) => {
    let [b_user_driver_license, b_date_from, b_time_from, pastOrUpcoming] = req.params.data.split('&')
    b_date_from = b_date_from.split('=')[1]
    b_time_from = b_time_from.split('=')[1]
    pastOrUpcoming = pastOrUpcoming.split('=')[1]
    const { Op } = require('sequelize')

    try {
        if (pastOrUpcoming === 'upcoming') {
            const upcomingRides = await Booking.findAll({
                where: {
                    b_user_driver_license,
                    b_date_from: {
                        [Op.gte]: b_date_from
                    },
                    b_status: {
                        [Op.ne]: 'Completed'
                    }
                }
            })

            const cars = []
            for (i = 0; i < upcomingRides.length; i++) {
                const car = await Car.findOne({
                    where: {
                        c_registration_number: upcomingRides[i].dataValues.b_car_registration_number
                    }
                })
                cars.push(car.dataValues)
            }

            const result = {
                upcomingRides,
                cars
            }

            res.status(200).send(result)
        } else {
            const upcomingRides = await Booking.findAll({
                where: {
                    b_user_driver_license,
                    b_date_from: {
                        [Op.lte]: b_date_from,
                    },
                    b_status: {
                        [Op.in]: ['Completed', 'Cancelled']
                    }
                }
            })

            const cars = []
            for (i = 0; i < upcomingRides.length; i++) {
                const car = await Car.findOne({
                    where: {
                        c_registration_number: upcomingRides[i].dataValues.b_car_registration_number
                    }
                })
                cars.push(car.dataValues)
            }

            const result = {
                upcomingRides,
                cars
            }

            res.status(200).send(result)
        }
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.post('/cancelbooking', async (req, res) => {
    try {
        await Booking.update({
            b_status: 'Cancelled'
        }, {
            where: {
                b_id: req.body.b_id
            }
        })

        res.status(201).send()
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.post('/getminimumdistancegarage', async (req, res) => {

    try {

        console.log(req.body)
        const g_id = req.body.g_id

        const inputGarage = await Garage.findAll({
            where: {
                g_id: req.body.g_id
            }
        })

        let origins = inputGarage[0].dataValues.g_latitude + ',' + inputGarage[0].dataValues.g_longitude

        const { Op } = require("sequelize");
        const garagesInSameCityArray = await Garage.findAll({
            where: {
                g_state: inputGarage[0].dataValues.g_state,
                g_city: inputGarage[0].dataValues.g_city,
                g_id: {
                    [Op.ne]: inputGarage[0].dataValues.g_id
                }
            }
        })

        let destinations = ''
        let garagesInSameCity = []
        for (i = 0; i < garagesInSameCityArray.length; i++) {
            garagesInSameCity.push(garagesInSameCityArray[i].dataValues)
            let temp = garagesInSameCityArray[i].dataValues.g_latitude + ',' + garagesInSameCityArray[i].dataValues.g_longitude + ';'
            destinations += temp
        }
        destinations = destinations.slice(0, destinations.length - 1)
        console.log(origins)
        console.log(destinations)
        const API_KEY = ''
        const url = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=' + origins + '&destinations=' + destinations + '&travelMode=driving&key=' + API_KEY

        const distData = await axios.get(url)

        const distanceData = distData.data.resourceSets[0].resources[0].results

        for (i = 0; i < garagesInSameCity.length; i++) {
            garagesInSameCity[i].distanceFromOrigin = distData.data.resourceSets[0].resources[0].results[i].travelDistance
            garagesInSameCity[i].travelTime = distData.data.resourceSets[0].resources[0].results[i].travelDuration
        }


        garagesInSameCity.sort(function (a, b) {
            return a.distanceFromOrigin - b.distanceFromOrigin;
        });

        result.flag = 'S'
        result.message = "Garages found successfully"
        result.data = garagesInSameCity
        res.status(201).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/updateMembership', async (req, res) => {
    try {
        const user = await UserMembership.findOne({
            where: {
                um_user_driver_license: req.body.um_user_driver_license
            }
        })
        console.log(user)
        if (user) {
            await UserMembership.update({
                renewed_on: moment().format('YYYY-MM-DD'),
                valid_till: moment(user.dataValues.valid_till).add(6, 'M').format('YYYY-MM-DD'),
                amount: req.body.amount
            }, {
                where: {
                    um_user_driver_license: req.body.um_user_driver_license
                }
            })
        } else {

            await UserMembership.create({
                um_user_driver_license: req.body.um_user_driver_license,
                start_date: moment().format('YYYY-MM-DD'),
                valid_till: moment().add(6, 'M').format('YYYY-MM-DD'),
                renewed_on: moment().format('YYYY-MM-DD'),
                amount: req.body.amount
            }, {
                fields: ['um_user_driver_license', 'start_date', 'valid_till', 'renewed_on', 'amount']
            })
        }

        res.status(201).send()
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/membershipDetails/:driverLicense', async (req, res) => {
    const membershipDetails = await UserMembership.findOne({
        where: {
            um_user_driver_license: req.params.driverLicense
        }
    })
    console.log(membershipDetails)
    res.status(200).send(membershipDetails.dataValues)
})

router.get('/userDetails/:email', async (req, res) => {
    const user = await User.findOne({
        where: {
            u_email_id: req.params.email
        }
    })

    res.status(200).send(user)
})

router.get('/membershipFee', async (req, res) => {
    const price = await MembershipFee.findOne()

    res.status(200).send(price)
})

router.patch('/updateUserAddress', async (req, res) => {

    try {
        await User.update({
            u_street: req.body.u_street,
            u_city: req.body.u_city,
            u_state: req.body.u_state,
            u_zip: req.body.u_zip
        }, {
            where: {
                u_driver_license: req.body.u_driver_license
            }
        })

        res.status(201).send()
    } catch (e) {
        console.log(e)
    }
})

router.get('/getGarageStateForUser', async (req, res) => {

    try {
        const data = await Garage.findAll({
            attributes:[
                [Sequelize.fn('DISTINCT', Sequelize.col('g_state')) ,'g_state']
            ]
          });
        result.flag = 'S'
        result.message = "Garage found successfully"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/endTrip', async (req, res) => {
    console.log(req.body)

    try {
        await Booking.update({
            b_status: 'Completed',
            b_late_fee: req.body.b_late_fee
        }, {
            where: {
                b_id: req.body.b_id
            }
        })

        res.status(201).send()
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router


module.exports = router
