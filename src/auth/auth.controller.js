import { generateJWT } from "../helpers/generateJWT.js";
import User from "../users/user.model.js";
import { hash, verify } from "argon2";
import { validatePassword } from "../middlewares/validatePassword.js";
import { validateLogin, validateRegister} from "../middlewares/validatorAuth.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const lowerEmail = email ? email.trim().toLowerCase() : null;
    const lowerUsername = username ? username.trim().toLowerCase() : null;

    const findUser = await User.findOne({
      $or: [{ email: lowerEmail }, { username: lowerUsername }],
    });

    if (!findUser) {
      return res.status(400).json({
        success: false,
        msg: "Usuario no encontrado",
      });
    }

    const validPass = await verify(findUser.password, password);

    if (!validPass) {
      return res.status(400).json({
        success: false,
        msg: "Contraseña incorrecta",
      });
    }

    await validateLogin(req, res, findUser, validPass);
    if (res.headersSent) return;

    const token = await generateJWT(findUser.id);

    return res.status(200).json({
      userDetails: {
        username: findUser.username,
        status: findUser.statusAccount,
        role: findUser.role,
        token: token,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { carne, ...data } = req.body;

    validatePassword(data.password);

    const encryptPass = await hash(data.password);

    const verifyUsername = await User.findOne({
      username: data.username.toLowerCase(),
      verification: true,
    });

    const verifyEmail = await User.findOne({
      email: data.email.toLowerCase(),
      verification: true,
    });

    const verifyCarne = await User.findOne({ carne });

    if (verifyEmail || verifyUsername || verifyCarne) {
      return res.status(400).json({
        success: false,
        msg: "El correo, usuario o carné ya está registrado.",
      });
    }

    const userData = await User.create({
      ...data,
      carne,
      password: encryptPass,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      userList: [],
    });

    await validateRegister(req, res, userData);
    if (res.headersSent) return;

    return res.status(200).json({
      msg: "Pendiente de activación para su cuenta",
      userData,
    });
    
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;

    await validateEmailToken(req, res);
    if (res.headersSent) return;

    const { email } = jwt.verify(token, process.env.SECRETOPRIVATEKEY);

    const user = await User.findOne({ email });

    await validateVerifyEmail(req, res, user, token);
    if (res.headersSent) return;

    user.verification = true;
    await user.save();
  } catch (e) {
    console.log(e);
    await validateExpiredToken(req, res);
    if (res.headersSent) return;
  }
};
