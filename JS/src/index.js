const { getMyWeather } = require('./getWeather')

class Person {
    constructor(age, address) {
        this.age = age;
        this.address = address
    }

    print = () => {
        console.log('Person class initiated')
    }
}

// define the person class
class Student extends Person {
    constructor(firstName, lastName, age, address) {
        super(age, address)
        this.firstName = firstName;
        this.lastName = lastName
    }

    print = () => {
        console.log('Student class initiated')
    }

    static finish = () => {
        console.log('The processing is done')
    }
}

let student1 = new Student('Samik', 'Biswas', 29, '101 E San Fernando'); student1.print()
let student2 = new Student('Arpan', 'Debnath', 27, '9 Aghore Sarani'); student2.print()

// adding new properties using the Object.assign
student1 = Object.assign(student1, { Concentration: 'Web Development' })
student2 = Object.assign(student2, { Concentration: 'Safety Analysis' })

/**
 * 1. Write a function that calls the getWeather function 
 */

var getWeatherForPerson = function (...args) {
    getMyWeather(this.firstName, this.lastName, this.age, this.address, args)
}

// input received as input
var input = ['Student, length, objects', { length: 2 }, student2, student1]

// closures
const process = ((input) => {

    var processCount = 0;

    // get rid of the extra data from the input
    input[0] = input[0].split(',')[0]

    // check if the input contains any special characters and the word Student
    if (/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(input[0]) && !input.includes('Student')) {
        console.log('Invalid Input')
        return
    }

    const [type, metadata] = input

    // further validations before starting the processing
    if (typeof type === 'string' && metadata.length === 2) {
        const students = input.slice(2, 4)

        students.forEach((student) => {

            if (student instanceof Student) {
                getWeatherForPerson.call(student)

                getWeatherForPerson.apply(student, ['San Jose State University', 'Software Engineering'])
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
const processCount = process(input)
console.log(processCount)