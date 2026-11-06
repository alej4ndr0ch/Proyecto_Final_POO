import HoursBeca from "./hoursBeca.model.js";
import User from "../users/user.model.js";
import mongoose from "mongoose";

export const addHoursBeca = async (req, res) => {
  try {
    const hoursBeca = await HoursBeca.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Se ha creado exitosamente el reporte",
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error, no se ha podido agregar el reporte",
      error: error.message,
    });
  }
};

export const getHoursBeca = async (req, res) => {
  try {
    const limite = Math.max(1, Number(req.query.limite) || 10);
    const desde = Math.max(0, Number(req.query.desde) || 0);

    const filtro = { status: "Pending" };

    const [total, hoursBeca] = await Promise.all([
      HoursBeca.countDocuments(filtro),
      HoursBeca.find(filtro)
        .populate("managerID", "name surname")
        .populate("studentID", "name surname")
        .skip(desde)
        .limit(limite)
        .sort({ day: -1 }),
    ]);
    return res.status(200).json({
      success: true,
      msg: "Se ha encontrado la información",
      total,
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error, no se ha podido listar las horas beca disponibles",
      error: error.message,
    });
  }
};

export const getHoursBecaById = async (req, res) => {
  try {
    const { id } = req.params;

    const hoursBeca = await HoursBeca.findById(id)
      .populate("name")
      .populate("managerID", "name surname")
      .populate("studentID", "name surname");

    if (!hoursBeca) {
      return res.status(404).json({
        success: false,
        msg: "Reporte no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Error, no se ha podido obtener el reporte",
      error: error.message,
    });
  }
};

export const filterHoursBecaByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const isValidDate = (value) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        msg: "Envía startDate y endDate válidas con formato YYYY-MM-DD.",
      });
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const endExclusive = new Date(`${endDate}T00:00:00.000Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    if (start >= endExclusive) {
      return res.status(400).json({
        success: false,
        msg: "startDate debe ser anterior o igual a endDate.",
      });
    }

    const hoursBeca = await HoursBeca.find({
      day: { $gte: start, $lt: endExclusive },
      status: "Active",
    })
      .populate("managerID", "name surname")
      .populate("studentID", "name surname")
      .sort({ day: -1 });

    return res.status(200).json({
      success: true,
      msg: "Resultados filtrados por rango de fechas.",
      total: hoursBeca.length,
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Error al filtrar por fechas.",
      error: error.message,
    });
  }
};

export const assignUserToHoursBeca = async (req, res) => {
  try {
    const { userId, carne, hoursBecaId, target } = req.body;

    const hasUserId = typeof userId === "string" && userId.trim() !== "";
    const hasCarne = typeof carne === "string" && carne.trim() !== "";
    const validTargets = ["studentID", "managerID"];

    if (
      !mongoose.isValidObjectId(hoursBecaId) ||
      !validTargets.includes(target) ||
      Boolean(hasUserId) === Boolean(hasCarne) ||
      (hasUserId && !mongoose.isValidObjectId(userId))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Envía un hoursBecaId válido, un target válido y exactamente uno: userId o carne.",
      });
    }

    const hoursBeca = await HoursBeca.findById(hoursBecaId);
    if (!hoursBeca) {
      return res.status(404).json({
        success: false,
        message: "Evento no encontrado.",
      });
    }

    const user = hasUserId
      ? await User.findById(userId)
      : await User.findOne({ carne: carne.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    if (target === "studentID" && hoursBeca.studentID) {
      if (String(hoursBeca.studentID) === String(user._id)) {
        return res.status(200).json({
          success: true,
          message:
            "El estudiante ya estaba asignado; no se sumaron las horas otra vez.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Esta hora beca ya está asignada a otro estudiante.",
      });
    }

    hoursBeca[target] = user._id;
    await hoursBeca.save();

    if (target === "studentID") {
      await User.updateOne(
        { _id: user._id },
        { $inc: { horasBecaDone: hoursBeca.hour } },
      );
    }

    await hoursBeca.populate(target, "name surname carne");

    return res.status(200).json({
      success: true,
      message: "Usuario asignado correctamente al evento.",
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al asignar el usuario.",
      error: error.message,
    });
  }
};

//********************************* ADMIN ***************************** */

export const listHoursBecaPending = async (req, res) => {
  try {
    const hoursBeca = await HoursBeca.find({ status: "Pending" })
      .populate("managerID", "name surname")
      .populate("studentID", "name surname")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Horas beca pendientes obtenidas correctamente.",
      total: hoursBeca.length,
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al listar las horas beca pendientes.",
      error: error.message,
    });
  }
};

export const activeHoursBeca = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "El ID de la hora beca no es válido.",
      });
    }

    const hoursBeca = await HoursBeca.findByIdAndUpdate(
      id,
      { $set: { status: "Active" } },
      { new: true, runValidators: true },
    );

    if (!hoursBeca) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la hora beca.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "La hora beca se activó correctamente.",
      hoursBeca,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al activar la hora beca.",
      error: error.message,
    });
  }
};
