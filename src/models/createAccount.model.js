// Import libraries
const { v4 } = require("uuid")

// Import database
const db = require("../config/firebaseSDK")
const hs256 = require("js-sha256")

// Generate create account time
function createdTime() {
    const time = new Date()
    const minute = time.getMinutes()
    const date = time.getDate().toString()
    const month = time.getMonth().toString()
    const year = time.getFullYear().toString()
    const hour = time.getHours().toString()

    return `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute} - ${date} THG ${month}, ${year}`
}

// Check existence's account
async function checkExistence(req, res) {
    const data = req.body.data
    const gmail = data.gmail
    const userRef = await db.collection("accounts").doc(btoa(gmail)).get()

    if (userRef.exists) {
        res.clearCookie("otp")
        return {
            status: 404,
            data: {
                mess: "Account already exist"
            }
        }
    } else return false
}

// Model
const createAccount_Model = async (req, res) => {
    const existenceAccount = await checkExistence(req, res)
    if (existenceAccount.status == 404) return existenceAccount

    const data = req.body.data
    const username = data.username
    const gmail = data.gmail
    const password = data.password
    const uuid = "u-wya:" + v4()

    const batch = db.batch() // Use to merge requests

    const ref_createAccount = db.collection("accounts").doc(btoa(gmail))
    batch.set(ref_createAccount, {
        username: username,
        gmail: gmail,
        password: hs256(password),
        uuid,
        createdTime: createdTime(),
    })
    const ref_userInformation = db.collection("userInformation").doc(btoa(gmail))
    batch.set(ref_userInformation, {
        username: username,
        gmail: gmail,
        uuid,
        avartarCode: "", // avartarCode is ID of Avatar. We can use this avartarCode to get img in an other database. 
        friends: {
            status: "public", // Public: List friend is gonna to watch by anyone
            list: [] // List friends
        },
        requests: [], 
        // requests is a list which contains requirements. The structure's request is object. 
        // This object contains attibutes: name, gmail, userID, avartarCode, timeSent. 
        setting: {}, //All config are set by user. Contain: Theme, Black list,...
        profileStatus: "public" //User's profile is public of private - Anyone can watch your profile if you set public
    })

    const result = await batch.commit().then(() => {
        return {
            status: 200,
            data: {
                mess: "Registered successfully"
            }
        }
    }).catch(() => {
        return {
            status: 404,
            data: {
                mess: "Registration failed"
            }
        }
    })

    return result
}

module.exports = createAccount_Model