import { body } from "express-validator";
import { validarCampos } from "./validarCampos.js"
import { emailUsed, pendingAccount, usedUsername, usedCarne } from "../helpers/db-Validator.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import User from "../users/user.model.js";

export const registerValidator =[
    body("name", "The name is required").not().isEmpty(),
    body("surname", "The sur    name is required").not().isEmpty(),
    body("username", "The username is required").not().isEmpty(),
    body("username").custom(usedUsername),
    body("carne").custom(usedCarne),
    body("address", "The address is required").not().isEmpty(),
    body("phone", "The phone is required").not().isEmpty(),
    body("email", "The email is required").not().isEmpty(),
    body("email").custom(emailUsed),
    body("password", "The password is required").notEmpty().isLength({min: 8}).withMessage("The minimum number of characters in the password must be 8"),
    validarCampos
]

export const loginValidator = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Ingresa una dirección de correo válida"),

    body("email")
        .optional()
        .custom(pendingAccount),

    body("username")
        .optional()
        .isString()
        .withMessage("Ingresa un username válido"),

    body("password", "La contraseña es obligatoria")
        .notEmpty(),

    validarCampos
];

export const validateLogin = async (req, res, findUser, validPass) => {
  if(findUser.verification != true){
    return res.status(401).json({
        success:false,
        msg: "Falta validar la cuenta."
    })
  }

  if(findUser.statusAccount == 'Pending'){
    return res.status(401).json({
        success:false,
        msg: "Cuenta aún no validada por administrador."
    })
  }

  if(!validPass){
    return res.status(401).json({
        success:false,
        msg: "Incorrect password"
    })
  }
}

export const validateRegister = async (req, res, userData) => {
    const {carne, ...data} = req.body
    const token = jwt.sign({ email: data.email.toLowerCase()}, 
      process.env.SECRETOPRIVATEKEY, {
        expiresIn: "1.5m"
    })
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
    })
    const verifyUser = await User.findOne({email: data.email.toLowerCase(), verification: false})        
}
