"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
export default function Home() {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await signIn("credentials", {
        email: formData.get("email"),
        contraseña: formData.get("contraseña"),
        redirect: false,
      });
      if (res?.error) {
        console.log("error");
      }
      if (res?.ok) {
        return router.push("/inicio");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div class="min-h-screen flex items-center justify-center bg-slate-600 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h1 class=" py-24 text-center text-6xl font-extrabold text-sky-200">
            Pictionary
          </h1>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          class="mt-8 space-y-6"
          action="#"
          method="POST"
        >
          <input type="hidden" name="remember" value="true" />
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">
                Nombre de usuario
              </label>
              <input
                id="usuario"
                name="email"
                type="text"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <label for="password" class="sr-only">
                Contraseña
              </label>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                autocomplete="current-password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Recordarme
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-white hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                {/* <!-- Heroicon name: solid/lock-closed --> */}
                <svg
                  class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a3 3 0 00-3 3v2H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-3V5a3 3 0 00-3-3h-2zm-3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm8 8H4v-5h12v5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
