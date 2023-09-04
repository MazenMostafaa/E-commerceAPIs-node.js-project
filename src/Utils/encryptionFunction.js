import crypto from 'crypto'

let secret_key = 'fd85b494-aaaa'
let secret_iv = 'smslt'
let encryptionMethod = 'AES-256-CBC'
let key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substr(0, 32)
let iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substr(0, 16)

// =====================encryption Fun=============== 
export const encryptionFun = ({
    phoneNumber = ''
} = {}) => {

    const encryptor = crypto.createCipheriv(encryptionMethod, key, iv)

    const ase_encrypted = encryptor.update(phoneNumber, 'utf-8', 'base64') + encryptor.final('base64')

    return Buffer.from(ase_encrypted).toString('base64')

}

// =====================decryption Fun===============

export const decryptionFun = ({
    encryptedPhoneNumber = '',
} = {}) => {

    const buff = Buffer.from(encryptedPhoneNumber, 'base64')
    encryptedPhoneNumber = buff.toString('utf-8')

    const decryptor = crypto.createDecipheriv(encryptionMethod, key, iv)

    return decryptor.update(encryptedPhoneNumber, 'base64', 'utf-8') + decryptor.final('utf-8')
}