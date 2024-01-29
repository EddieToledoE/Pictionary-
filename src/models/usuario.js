import { Schema, model, models } from "mongoose";
const UsuarioSchema = new Schema(
    {
        usuario: {
            type: String,
            required: [true, "Usuario necesario"],
            unique: true,
        },
        contra: {
            type: String,
            required: [true, "Contrasena necesaria"],
            minlength: [8, "La contraseña debe tener al menos 8 caracteres."],
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

export default models.usuarios || model("usuarios", UsuarioSchema);
