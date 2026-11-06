import { body } from "express-validator";
import { validateRole } from "./validateRole.js";
import { validarCampos } from "./validarCampos.js";
import { valueJWT } from "./valueJWT.js";
import { emailUsed, usedUsername, usedPhone } from "../helpers/db-Validator.js";

export const validatorListUser = [
    valueJWT,
    validarCampos
]

export const validatorUpdateUser = [
    valueJWT,
    validateRole("USER"),
    body("name", "The name is required").notEmpty(),
    body("surname", "The surname is required").notEmpty(),
    body("username", "The username is required").notEmpty(),
    body("username").custom(usedUsername),
    body("email", "The email is required").notEmpty(),
    body("email").custom(emailUsed),
    body("address", "The address is required").notEmpty(),
    body("phone", "The phone is required").notEmpty(),
    body("phone").custom(usedPhone),
    validarCampos
]

export const validatorUpdatePassword = [
    valueJWT,
    validateRole("USER", "ADMIN"),
    body("oldPassword", "The oldPassword is required").notEmpty(),
    body("password", "The new Password is required").notEmpty(),
    validarCampos
]