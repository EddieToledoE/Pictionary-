import { connectarBD } from "@/utils/mongo";
import { NextResponse } from "next/server";
import Usuario from "@/models/usuario";

export async function GET() {
  connectarBD();
  const ObtenerUsuarios = await Usuario.find();
  return NextResponse.json(ObtenerUsuarios);
}

export async function POST(request) {
  try {
    connectarBD();
    const data = await request.json();
    const CrearUsuario = new Usuario(data);
    console.log(data);
    const GuardarUsuario = await CrearUsuario.save();
    return NextResponse.json(GuardarUsuario);
  } catch (error) {
    return NextResponse.json(error.message, { status: 400 });
  }
}
