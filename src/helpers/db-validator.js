import User from "../users/user.model.js"

// //////////////////////// REGISTER //////////////////////// //

export const emailUsed = async (email = "") => {
  const emailLower = email.toLowerCase();
  const emailExists = await User.findOne({ email: emailLower });

  if (emailExists) {
    throw new Error(`The email ${email} has already been registered`);
  }
};

export const usedUsername = async (username = "") => {
  const usernameLower = username.toLowerCase();
  const usernameExists = await User.findOne({ username: usernameLower });

  if (usernameExists) {
    throw new Error(`The username ${username} has already been registered`);
  }
};

export const usedPhone = async(phone = "") => {
    const phoneUsed = await User.findOne({
        phone
    })

    if(phoneUsed){
        throw new Error(`The phone ${phone} has already been registered`)
    }
}

export const usedCarne = async(carne = "") => {
    const carneUsed = await User.findOne({
        carne
    })

    if(carneUsed){
        throw new Error(`The Carne ${carne} has already been registered`)
    }
}

// //////////////////////// Login //////////////////////// //

export const pendingAccount = async(email = "") => {
    const emailLower = email.toLowerCase()
    const isPending = await User.findOne({
        email : emailLower
    })

    if(isPending.statusAccount === "Pending"){
        throw new Error (`Your account is still pending comfirmation, please wait until is enabled`)
    }
}

// //////////////////////// Admin //////////////////////// //

export const noExistUserById = async (id = ' ') => {

    const existUser = await User.findById(id);
    if(!existUser){
        throw new Error(`The user with ID ${id} does not exist`);
    }
}

export const userDisabledId = async (id = "") =>{
    const findUserDisabled = await User.findById(id)
    if(findUserDisabled.statusAccount === "Pending" && findUserDisabled.verification === false){
        throw new Error(`El usuario ${findUserDisabled.name}que intenta Deshabilitar ya se encuentra sin acceso`)
    }
}

// //////////////////////// Lapsed //////////////////////// //
