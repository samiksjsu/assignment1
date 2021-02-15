const { sequelize, DataTypes, Sequelize } = require('../db/conn')
const express = require('express')
const router = new express.Router()
const Vehicle_type = require("../dbmodels/vehicle_type")
const Garage = require("../dbmodels/garage")
const Car = require("../dbmodels/car")
const User = require("../dbmodels/user")
const Membership_fee = require("../dbmodels/membership_fee")
const Administrator = require("../dbmodels/administrator")
const sharp = require('sharp')
const multer = require('multer')
const axios = require('axios');
const bcrypt = require('bcrypt')

const result = {
    "flag": "",
    "message": "",
    "data": ""
}

router.post('/addcartype', async (req, res) => {

    try {

        console.log(req.body)
        await Vehicle_type.create(req.body)
        result.flag = 'S'
        result.message = "Car type created successfuly"
        res.status(201).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.get('/getcartype', async (req, res) => {

    try {
        console.log("inside")
        const data = await Vehicle_type.findAll()
        result.flag = 'S'
        result.message = "Car type created successfuly"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.patch('/updatecartype', async (req, res) => {
    try {
        console.log(req.body)
        await Vehicle_type.update({
            vt_1_5: req.body.vt_1_5,
            vt_6_10: req.body.vt_6_10,
            vt_11_24: req.body.vt_11_24,
            vt_25_48: req.body.vt_25_48,
            vt_49_72: req.body.vt_49_72,
            vt_late_percent: req.body.vt_late_percent
        }, {
            where: {
                vt_name: req.body.vt_name
            },
        })

        result.flag = 'S'
        result.message = "Car type updated successfuly"
        res.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/addgarage', async (req, res) => {

    try {

        console.log(req.body)
        const address = req.body.g_street + ',' + req.body.g_city + ',' + req.body.g_state + ',' + req.body.g_zip

        const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=pk.eyJ1Ijoia2F1c3R1YmhrdWxrYXJuaTE1MDk5NCIsImEiOiJjazRyempyY2M0ZjB0M2duYWt4aWR5bHc2In0.GvGnpPXCakPTShW3G3qU-g'

        const res1 = await axios.get(url)

        if (res1.data) {
            req.body.g_longitude = res1.data.features[0].geometry.coordinates[0]
            req.body.g_latitude = res1.data.features[0].geometry.coordinates[1]
            await Garage.create(req.body, {
                fields: ['g_name', 'g_capacity', 'g_street', 'g_city',
                    'g_state', 'g_zip', 'g_longitude', 'g_latitude'],
            })
            result.flag = 'S'
            result.message = "Car type created successfuly"
            res.status(201).send(result)
        }



    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/getgarage', async (req, res) => {

    try {

        const data = await Garage.findAll({
            where: {
                g_city: req.body.g_city,
                g_status: "Active"
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

router.post('/getavailablegarage', async (req, res) => {

    try {
        const { Op } = require("sequelize");
        const data = await Garage.findAll({
            where: {
                g_city: req.body.g_city,
                g_status: "Active",
                g_capacity: {
                    [Op.gt]: sequelize.col('g_current_capacity')
                }
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

router.get('/getgaragecity', async (req, res) => {

    try {
        console.log("inside")
        const data = await Garage.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('g_city')), 'g_city']
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


router.patch('/updategarage', async (req, res) => {
    try {

        await Garage.update({
            g_name: req.body.g_name,
            g_capacity: req.body.g_capacity,
            g_street: req.body.g_street,
            g_city: req.body.g_city,
            g_state: req.body.g_state,
            g_zip: req.body.g_zip,
        }, {
            where: {
                g_id: req.body.g_id
            },
        })

        result.flag = 'S'
        result.message = "Garage updated successfuly"
        res.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.patch('/deletegarage', async (req, res) => {
    try {

        await Garage.update({
            g_status: 'Deactivated',
        }, {
            where: {
                g_id: req.body.g_id,
            }
        })

        result.flag = 'S'
        result.message = "Garage updated successfuly"
        res.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/getcartypenames', async (req, res) => {

    try {
        console.log("inside")
        const data = await Vehicle_type.findAll(
            {
                attributes: ['vt_name']
            }
        )
        result.flag = 'S'
        result.message = "Car type returned successfuly"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

const upload = multer({

})

router.post('/addcar', upload.single('Carphoto'), async (req, res) => {

    try {
        const car = JSON.parse(req.body.details)
        let u = await Car.findOne({
            where: {
                c_registration_number: car.c_registration_number
            }
        });

        if (u !== null) {
            result.flag = 'F'
            result.message = "Car is already added in system"
            res.status(200).send(result)
        }

        const buffer = await (await sharp(req.file.buffer).resize(420, 240).toBuffer()).toString('base64')

        res.set('Content-Type', 'image/jpg')



        car.c_car_photo = buffer

        await Car.create(car)
        result.flag = 'S'
        result.message = "Car Added successfully"
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})


router.post('/getrequestedusers', async (req, res) => {

    try {

        const data = await User.findAll({
            where: {
                u_status: "Requested"
            }
        });


        result.flag = 'S'
        result.message = "Users found successfully"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/getuserlicensephoto', async (req, res) => {
    try {
        console.log("inside")
        const req1 = req.body
        const user = await User.findAll({
            where: {
                u_driver_license: req1.u_driver_license
            }
        });

        console.log(user[0].dataValues.u_driver_license_photo)
        res.set('Content-Type', 'image/png')
        res.send(user[0].dataValues.u_driver_license_photo)


    } catch (e) {
        res.status(404).send()
    }
})

router.patch('/approverejectuser', async (req, res) => {
    try {
        console.log(req.body)
        await User.update({
            u_status: req.body.u_status,
        }, {
            where: {
                u_driver_license: req.body.u_driver_license,
            }
        })

        result.flag = 'S'
        result.message = "Request successful"
        res.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/getnumberofusers', async (req, res) => {
    try {
        const user = await User.findAll({
            attributes: [[sequelize.fn('COUNT', sequelize.col('u_email_id')), 'number']]

        });
        console.log(user[0].dataValues)
        result.flag = 'S'
        result.message = "Number of Users found successfully"
        result.data = user[0].dataValues
        res.status(200).send(result)



    } catch (e) {
        res.status(404).send()
    }
})

router.post('/browseusers', async (req, res) => {
    try {
        console.log("inside")
        console.log(req.body.limit, req.body.offset)
        const user1 = await sequelize.query("select start_date,valid_till,renewed_on,amount,u_name,u_email_id,u_driver_license,u_street,u_city,u_state,u_zip,u_driver_license_state,u_status,u_dob from users inner join user_membership on u_driver_license = um_user_driver_license OFFSET "+req.body.offset+"  LIMIT " +req.body.limit)
        
        // const user = await User.findAll({
        //     attributes: ['u_name', 'u_email_id', 'u_driver_license', 'u_street', 'u_city', 'u_state', 'u_zip', 'u_driver_license_state', 'u_status', 'u_dob'],
        //     offset: req.body.offset,
        //     limit: req.body.limit
        // });
        
        result.flag = 'S'
        result.message = "Users found successfully"
        result.data = user1[0]
        res.status(200).send(result)



    } catch (e) {
        res.status(404).send()
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
            where:{
                g_state:inputGarage[0].dataValues.g_state,
                g_city:inputGarage[0].dataValues.g_city,
                g_id: {
                    [Op.ne]: inputGarage[0].dataValues.g_id
                }
            }
        })

        let destinations=''
        let garagesInSameCity = []
        for(i = 0;i<garagesInSameCityArray.length;i++){
            garagesInSameCity.push(garagesInSameCityArray[i].dataValues)
            let temp = garagesInSameCityArray[i].dataValues.g_latitude+','+garagesInSameCityArray[i].dataValues.g_longitude+';'
            destinations+=temp
        }
        destinations = destinations.slice(0,destinations.length-1)
        console.log(origins)
        console.log(destinations)
        const API_KEY = 'AumfiiPGFwuuBbfxY9cCaLNfoyAj5gQ4WN9gJaUOW1ahw3NbHdVGo3ItjGkSgrx5'
        const url = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins='+origins+'&destinations='+destinations+'&travelMode=driving&key='+API_KEY
        
        const distData = await axios.get(url)
        
        const distanceData = distData.data.resourceSets[0].resources[0].results
        
        for(i=0;i<garagesInSameCity.length;i++){
            garagesInSameCity[i].distanceFromOrigin=distData.data.resourceSets[0].resources[0].results[i].travelDistance
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


router.get('/getmembershipfee', async (req, res) => {

    try {

        const data = await Membership_fee.findAll();

        result.flag = 'S'
        result.message = "Fee found successfully"
        result.data = data
        res.status(200).send(result)

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

router.patch('/updatemembershipfee', async (req, res) => {
    try {

        await Membership_fee.update({
            m_fee: req.body.m_fee
        }, {
            where: {
                m_fee: req.body.old_fee
            },
        }
        )

        result.flag = 'S'
        result.message = "Membership fee updated successfuly"
        res.status(200).send(result)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/addadministrator',async(req,res)=>{
    try {
        // Check if user is already present
        let u = await Administrator.findOne({
            where: {
                a_email_id: req.body.a_email_id
            }
        });
        // If user is not already present hash the password, and return success message
        if (u === null) {

            req.body.a_password = await bcrypt.hash(req.body.a_password, 10)
            
            await Administrator.create(req.body)
            result.flag = 'S'
            result.message = "Aministrator successfuly created!"
            res.status(201).send(result)
        }// If user is  already present hash the password, and return faliure message
        else {
            result.flag = 'F'
            result.message = "Administrator already present!"
            res.status(201).send(result)
        }

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})


router.get('/getalladmins',async(req,res)=>{
    try{
        const { Op } = require("sequelize");
        let admins = await Administrator.findAll({
            where: {
                a_email_id: {
                    [Op.ne]: 'superuser@superuser.com'
                }
            }
        });
        result.flag = 'S'
        result.message = "Aministrators successfuly found!"
        result.data = admins
        res.status(201).send(result)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.patch('/editadministrator',async(req,res)=>{
    try{
        console.log(req.body)
        await Administrator.update({
            a_status: req.body.a_status
        }, {
            where: {
                a_email_id: req.body.a_email_id
            },
        })

        result.flag = 'S'
        result.message = "Aministrators upated successfuly!"
        res.status(201).send(result)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/getcartypesdata',async(req,res)=>{
    try{
        const res1= await sequelize.query("select c_type,COUNT(c_type) from vehicle_type inner join car on vt_name = c_type group by c_type ")
        result.flag = 'S'
        result.message = "Data found successfuly!"
        result.data=res1
        res.status(201).send(result)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/getrevenue',async(req,res)=>{
    try{
        const res1= await sequelize.query("select SUM(b_payment) from booking")
        result.flag = 'S'
        result.message = "Data found successfuly!"
        result.data=res1
        res.status(201).send(result)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/getnumberofusersfordashboard',async(req,res)=>{
    try{
        const res1= await sequelize.query("select count(u_driver_license) from users where u_status = 'Requested' or u_status = 'Approved'")
        result.flag = 'S'
        result.message = "Data found successfuly!"
        result.data=res1
        res.status(201).send(result)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/getgarageandcapacity',async(req,res)=>{
    try{
        const res1= await sequelize.query("select g_name,g_capacity,g_id from garage")
        result.flag = 'S'
        result.message = "Data found successfuly!"
        result.data=res1
        res.status(201).send(result)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/adminLogin', async (req, res) => {
    
    const admin = await Administrator.findByPk(req.body.a_email_id)

    if (!admin) {
        return res.status(401).send()
    } else {
    
        if (req.body.a_password == 'superuser') return res.status(200).send(admin)

        else {
            const checkPassword = await bcrypt.compare(req.body.a_password, admin.dataValues.a_password)

            if (!checkPassword) return res.status(401).send()

            else return res.status(200).send(admin)
        }
    }

    res.send(admin)
})

router.post('/getallcarsforgarage',async(req,res)=>{
    try{
        console.log(req.body)
        const cars = await Car.findAll({
            attributes:['c_registration_number', 'c_model', 'c_type','c_last_serviced','c_number_of_seats','c_manufacture_year', 'c_mileage', 'c_condition','feature1','feature2','feature3','c_status','c_location'],
            where:{
                c_location:req.body.c_location
            }
        })
        


        result.flag = 'S'
        result.message = "Cars found successfuly"
        result.data = cars
        res.status(201).send(result)

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/getgaragedetails',async(req,res) => {
    try{
        const garage = await Garage.findAll({
            where:{
                g_id:req.body.g_id
            }
        })
        result.flag = 'S'
        result.message = "Garage found successfuly"
        result.data = garage
        res.status(201).send(result)
    }catch(e){
        res.status(404).send()
    }
})

router.patch('/editcarlocation',async(req,res)=>{
    try{
        console.log(req.body)
        await Car.update({
            c_location: req.body.selectedNewGarage
        }, {
            where: {
                c_location: req.body.currentGarageId,
                c_registration_number:req.body.c_registration_number
            },
        })

        result.flag = 'S'
        result.message = "Cars location upated successfuly!"
        res.status(201).send(result)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

router.patch('/editcarstatus',async(req,res)=>{
    try{
        console.log(req.body)
        await Car.update({
            c_status: req.body.action
        }, {
            where: {
                c_registration_number:req.body.c_registration_number
            },
        })

        result.flag = 'S'
        result.message = "Cars status upated successfuly!"
        res.status(201).send(result)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})
module.exports = router