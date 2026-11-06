import express from "express";
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import {hash} from "argon2"
import User from "../src/users/user.model.js";
import authRoutes from "../src/auth/auth.routes.js"
import userRoutes from "../src/users/user.routes.js"
import hoursBecaRoutes from "../src/hoursBeca/hoursBeca.routes.js"

const middlewares = (app) =>{
    app.use(express.urlencoded({extended: false}))
    app.use(cors())
    app.use(express.json())
    app.use(helmet())
    app.use(morgan("dev"))
}

const routes = (app) => {
    app.use('/HB/v1/auth', authRoutes);
    app.use('/HB/v1/users', userRoutes);
    app.use('/HB/v1/hoursBeca', hoursBecaRoutes);
};

const conectDB = async() =>{
    try {
        await dbConnection()
        console.log("La conexión con la base de datos ha sido exitosa!!!")
    } catch (e) {
        console.error("Error al intentar conectar con la base de datos")
        process.exit(1)
    }
}

export const initServer = async() =>{
    const app = express()
    const Port = process.env.PORT || 3000
    try {
        middlewares(app)
        conectDB()
        routes(app)
        app.listen(Port)
        console.log(`SERVER INIT IN PORT ${Port}`)
    } catch (e) {
        console.log(`SERVER FALIED INIT IN PORT ${Port}`)
    }
}

export const defaultAdmin = async () => {
  try {
    const Adminemail = "adminb@gmail.com";
    const password = "-ADMINB-";
    const Adminusername = "ADMINB";
    const AdminAccount = "1";

    const existAdmin = await User.findOne({
      $or: [{ email: Adminemail }, { carne: AdminAccount }]
    });

    if (!existAdmin) {
      const passwordEncrypt = await hash(password);

      const adminUser = new User({
        name: "ADMINB",
        surname: "AdminB",
        username: Adminusername.toLowerCase(),
        carne: AdminAccount,
        email: Adminemail.toLowerCase(),
        password: passwordEncrypt,
        role: "ADMIN",
        address: "-----",
        phone: 12345678,
        statusAccount: "Active",
        verification: true
      });

      await adminUser.save();
      console.log("Administrador por defecto ha sido creado exitosamente!!!");
    } else {
      console.log("Ya existe un Administrador con ese email o accountNumber");
    }
  } catch (er) {
    console.error("Error al crear el Administrador ", er);
  }
};