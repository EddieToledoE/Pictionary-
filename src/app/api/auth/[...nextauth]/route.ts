import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectarBD } from "@/utils/mongo";
import Usuario from "@/models/usuario";
import bcrypt from "bcryptjs";
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Correo",
          type: "text",
          placeholder: "Correo@gmail.com",
        },
        contraseña: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        await connectarBD();
        console.log(credentials);
        const UsuarioEncontrado = await Usuario.findOne({
          usuario: credentials?.email,
        });
        if (!UsuarioEncontrado) throw new Error("Usuario no encontrado");
        const coincidencia = await bcrypt.compare(
          credentials!.contraseña,
          UsuarioEncontrado.contra
        );
        if (!coincidencia) throw new Error("La contraseña no coincide");
        return UsuarioEncontrado;
      },
    }),
  ],
  callbacks: {
    jwt({ account, token, user, profile, session }) {
      if (user) token.user = user;
      return token;
    },
    session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
