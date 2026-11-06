import User from "./user.model.js"
import { validatePassword } from "../middlewares/validatePassword.js"
import { hash, verify } from "argon2"

export const getUsers = async(req, res) => {
    try{
        const user = req.user._id

        const listUser = await User.findOne(user)

        return res.status(200).json({
            msg: "El usuario ha sido encontrado",
            listUser
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if(!user) {
      return res.status(404).json({
        success: false,
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Error obteniendo el usuario",
      error: error.message,
    });
  }
};

export const editStateUser = async(req, res) => {
    try{
        const {id} = req.params

        await User.findByIdAndUpdate(id, {statusAccount: "Pending", verification: false}, {new: true})

        return res.status(200).json({
            msg: "La cuenta ha sido desactivada"
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

export const putUser = async(req, res) => {
    try{
        const user = req.user._id

        const { accountNumber, dpi, statusAccount, password, ...data} = req.body

        const putData = await User.findByIdAndUpdate(user,{...data}, {new: true})

        return res.status(200).json({
            message: "Se ha actualizado correctamente la informacion",
            putData
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            error: e.message
        })
    }
}

export const updatePassword = async(req, res) =>{
    try {
        const userId = req.user._id
        const { oldPassword, password } = req.body
        console.log(userId)

        const userFounded = await User.findById(userId)
        const verifyPass = await verify(userFounded.password, oldPassword)

        if(!verifyPass){
            return res.status(401).json({
                msg: `The password ${oldPassword} is Incorrect`
            })
        }
        validatePassword(password)

        const pass = await hash(password)
        await User.findByIdAndUpdate(userId, {password: pass}, {new: true})

        return res.status(200).json({
            msg: "Contraseña actualizada con exito"
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

// //////////////////////// Administrador //////////////////////// //

export const getUsersPending = async (req, res) => {
    try {
        const usersPending = await User.find({ statusAccount: "Pending" });

        return res.status(200).json({
            success: true,
            message: "Los usuarios pendientes han sido encontrados correctamente",
            usersPending,
        });
  } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Sucedió un error, no se pudo listar los usuarios pendientes",
            error: e.message,
        });
  }
};

export const activeUsers = async(req, res) => {
    try{
        const {id} = req.params

        const user = await User.findByIdAndUpdate(id, {statusAccount: "Active"}, {verification: true}, {new: true})

        return res.status(200).json({
            message: "Se ha podido encontrar alos usuarios exitosamente",
            user
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Sucedio un error, no se ha logrado activar al usuario",
            error: e.message
        })
    }
}