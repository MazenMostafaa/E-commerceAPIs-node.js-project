import crypto from 'crypto'

// =====================encryption Fun=============== 
export const encryptionFun = ({
    // key = procces.env.DEFAULT_KEY,
    phoneNumber = '',
} = {}) => {


    // const encodedPhoneNumbers = phoneNumber.map(phone => {

    const iv = crypto.randomBytes(16)

    const key = crypto.getRandomValues(32)

    const cipher = crypto.createCipheriv('AES-256-CBC', key, iv)

    const encryptedPhoneNumber = cipher.update(phoneNumber) + cipher.final()

    // return encryptedPhoneNumber;

    if (!encryptedPhoneNumber) {
        return next(new Error('fail to encrypt', { cause: 400 }))
    }
    else {
        console.log(encryptedPhoneNumber);
        return encryptedPhoneNumber

    }

    // })

    // console.log(encodedPhoneNumbers) //Return an array of encrypted phones

    // if (encodedPhoneNumbers.length) {
    //     return true
    // }
    // else {
    //     return false
    // }

}

// =====================decryption Fun===============

export const decryptionFun = ({
    key = procces.env.DEFAULT_KEY,
    phoneNumber = [],
} = {}) => {

    const decodedPhoneNumbers = phoneNumber.map(phoneNumber => {

        const cipher = crypto.createDecipheriv('AES-256-CBC', key, iv);

        const decryptedPhoneNumber = cipher.update(phoneNumber) + cipher.final()

        return decryptedPhoneNumber;
    })

    console.log(decodedPhoneNumbers)

    return decodedPhoneNumbers   //Return an array of decrypted phones
}