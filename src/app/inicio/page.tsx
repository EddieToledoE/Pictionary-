'use client'
import Navbar from "@/components/nav";
import { useRouter } from "next/navigation";
export default function Inicio() {
  const router = useRouter();
  return (
    <div>
       <Navbar/>
       <div className="w-screen h-screen bg-black flex px-12 py-20 gap-x-4">
        <div onClick={()=>{
           router.push("/pizarra");
        }} className="w-1/2 bg-slate-500 h-1/2 m-2 text-white text-7xl justify-center text-center"> Pizarra 1</div>
        <div onClick={()=>{
           router.push("/pizarra2");
        }} className="w-1/2 bg-slate-200 h-1/2 m-2 text-black text-7xl justify-center text-center"> Pizarra 2</div>
       </div>
    </div>
  );
}
