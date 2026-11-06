import { body } from "express-validator";
import { noExistUserById } from "../helpers/db-Validator.js"
import { valueJWT } from "./valueJWT.js"
import { validarCampos } from "./validarCampos.js"
import { validateRole } from "./validateRole.js"

export const validatorAddHoursBeca = [
    valueJWT,
    validateRole("ADMIN"),
    body("name", "The name is required").notEmpty(),
    body("managerID").custom(noExistUserById),
    body("managerID", "The carne to manager is required").notEmpty().isLength({min: 4})
    .withMessage("The minimum number of characters in the password must be 4"),
    body("image", "The image is required").notEmpty(),
    validarCampos
]