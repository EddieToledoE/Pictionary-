"use client"
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useState,useEffect } from "react";
export default function Nav() {
    const { data: session } = useSession();
    const [usuario, setUsuario] = useState("");
    console.log(session)
    useEffect(() => {
       
        setUsuario(session?.user?.usuario );
      }, [session]);

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white text-xl font-bold">Pictionary</a>

        <div className="space-x-4">
          <h1  className="text-white hover:underline">Bienvenido : {usuario} </h1>
        </div>
        <button
              onClick={() => {
                signOut();
              }}
              type="submit"
              className="group relative w-1/12 flex justify-center py-2 px-4 border border-black text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              </span>
              Cerrar Sesion
            </button>
      </div>

    </nav>
  );
};


