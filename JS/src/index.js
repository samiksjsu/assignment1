"use strict"

const { getMyWeather } = require('./getWeather')

// parent class
class Person {
    constructor(age, address) {
        this.age = age;
        this.address = address
    }

    // general method in parent class to be overridden by the child class
    print = () => {
        console.log('Person class initiated')
    }
}

// child class demonstrating inheritance
class Student extends Person {
    constructor(firstName, lastName, age, address) {
        super(age, address)
        this.firstName = firstName;
        this.lastName = lastName
    }

    // method overriding
    print = () => {
        console.log(`Student ${this.firstName} initiated`)
        console.log(this)
    }

    // class static method to be called after the processing is done
    static finish = () => {
        console.log('The processing is done')
    }
}

let student1 = new Student('Samik', 'Biswas', 29, '101 E San Fernando'); 
let student2 = new Student('Arpan', 'Debnath', 27, '9 Aghore Sarani'); 

// adding new properties using the Object.assign
student1 = Object.assign(student1, { Concentration: 'Web Development' })
student2 = Object.assign(student2, { Concentration: 'Safety Analysis' })

student1.print()
student2.print()


// Processing function
/**
 * 1. Write a function that calls the getWeather function 
 */

var getWeatherForPerson = function (...args) {
    getMyWeather(this.firstName, this.lastName, this.age, this.address, args)
}

// input received as input
var input = ['Student, length, objects', { length: 2 }, student2, student1]

// closures, use of arrow function
const process = ((input) => {

    var processCount = 0;

    // get rid of the extra data from the input. Use of Split function
    input[0] = input[0].split(',')[0]

    // check if the input contains any special characters and the word Student. Use of Regular Expression
    if (/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(input[0]) && !input.includes('Student')) {
        console.log('Invalid Input')
        return
    }

    const [type, metadata] = input

    // further validations before starting the processing
    if (metadata.length >= 0) {

        // Getting the students object from the input using the Array.slice() functrion
        const students = input.slice(2, 2 + metadata.length)
        students.forEach((student) => {
            // checking if the received input is an object of Student class using typeOf and instanceOf
            if (typeof student === 'object' && student instanceof Student) {

                console.log('Sending for weather')
                getWeatherForPerson.call(student, 'Call argument 1', 'Call argument 2')

                getWeatherForPerson.apply(student, ['Apply argument 1', 'Apply argument 2'])
            } else {
                return
            }
        })

        // calling static method after the process is finished
        Student.finish()
    }

    return function () { processCount += 1; return processCount }
})(input)

// define external functions to be later bind with objects
const getName = function () {
    console.log(`The name of the student is: ${this.firstName} ${this.lastName}`)
}

// binding the getName function to the objects
const getNameBound = getName.bind(student1)
getNameBound()

// start the processing
process(input)
process(input)

// getting the final process count as part of closures demo. 
// Since processing was run 3 times, processCount should be 3
const processCount = process(input)
console.log(processCount)