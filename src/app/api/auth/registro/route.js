import { NextResponse } from "next/server";
import Usuario from "@/models/usuario";
import bcrypt from "bcryptjs";
import { connectarBD } from "@/utils/mongo";

export async function POST(request) {
  const { email, contraseña } = await request.json();
  console.log(email, contraseña);

  if (!contraseña || contraseña.length < 8)
    return NextResponse.json(
      {
        message: "La contraseña debe tener al menos 8 caracteres",
      },
      {
        status: 400,
      }
    );

  try {
    await connectarBD();
    const UsuarioEncontrado = await Usuario.findOne({ email });
    if (UsuarioEncontrado)
      return NextResponse.json(
        {
          message: "Ese usuario ya existe",
        },
        {
          status: 409,
        }
      );

    const contracifrada = await bcrypt.hash(contraseña, 12);
    const user = new Usuario({
      usuario: email,
      contra: contracifrada,
    });
    const usuarioguardado = await user.save();
    console.log(usuarioguardado);
    return NextResponse.json(usuarioguardado);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
