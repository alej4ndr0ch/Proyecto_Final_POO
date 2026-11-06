import { Router } from "express";
import { valueJWT } from "../middlewares/valueJWT.js";
import { validateRole } from "../middlewares/validateRole.js";
import { addHoursBeca, getHoursBeca, getHoursBecaById,
    filterHoursBecaByDate, assignUserToHoursBeca, listHoursBecaPending,
    activeHoursBeca
 } from "./hoursBeca.controller.js";
import { validatorListUser } from "../middlewares/validatorUser.js"
import { validatorAddHoursBeca } from "../middlewares/validatorHoursBeca.js";

const router = Router()

router.post(
    "/addHoursBeca",
    validatorAddHoursBeca,
    addHoursBeca
)

router.get(
    "/getHoursBeca",
    getHoursBeca
)

router.get(
    "/getHoursBecaById/:id",
    getHoursBecaById
)

router.post(
    "/filterDate",
    filterHoursBecaByDate
)

router.post(
    "/assingUser",
    assignUserToHoursBeca
)

router.get(
    "/pending",
    validatorListUser,
    listHoursBecaPending
);

router.post(
    "/activate/:id",
    validatorListUser,
    activeHoursBeca
);

export default router;