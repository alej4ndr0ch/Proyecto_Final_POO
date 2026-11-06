import User from "../users/user.model.js";
import jwt from "jsonwebtoken";

export const valueJWT = async (req, resp, next) => {
  const tokenHeader = req.header("Authorization");

  if (!tokenHeader) {
    return resp.status(401).json({
      msg: "No hay token para la petición",
    });
  }

  const token = tokenHeader.startsWith("Bearer ")
    ? tokenHeader.slice(7)
    : tokenHeader;

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    const usuario = await User.findByPk(uid);
    if (!usuario) {
      return resp.status(401).json({
        msg: "Usuario no existe en la base de datos",
      });
    }

    if (!usuario.status) {
      return resp.status(401).json({
        msg: "Token no válido - usuario con estado: False",
      });
    }

    req.user = usuario;
    next();
  } catch (e) {
    console.error("Error al validar JWT:", e.message);
    resp.status(401).json({
      msg: "Token no válido",
    });
  }
};