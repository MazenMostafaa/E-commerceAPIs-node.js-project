import express from 'express'
import path from 'path'
import { config } from 'dotenv'
import { initiateApp } from './src/Utils/initiateApp.js'

config({ path: path.resolve('./config/.env') })

const app = express()

initiateApp(app, express)