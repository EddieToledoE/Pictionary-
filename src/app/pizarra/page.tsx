'use client'
import { UseDraw } from "@/hooks/useDraw";
import { FC, useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { drawLine } from "@/utils/drawLine";
import {io} from "socket.io-client"
import { useSession } from "next-auth/react";
import axios from 'axios';
import Navbar from "@/components/nav";

interface pageProps {}

const page: FC<pageProps> = ({}) =>{
    const { data: session } = useSession();
    const [usuario, setUsuario] = useState("");
    console.log(session)
    useEffect(() => {
       
        const { usuario } = session?.user ?? {};
    
        setUsuario(usuario);
      }, [session]);

    const [color,setColor] = useState <string>('#000')
    const {canvasRef,onMouseDown,clear} = UseDraw(createLine)
    const [room, setRoom] = useState<string>("room1"); 
    const [ready, setReady] = useState(false);
    const [startGame, setStartGame] = useState(false);

    const checkReady = async () => {
        const response = await axios.get('http://localhost:3001/checkReady');
      
        if (response.data.ready) {
          setReady(true);
          setStartGame(response.data.startGame);
        }
      };
      
      const handleClick = async () => {
        await axios.post('http://localhost:3001/ready', { userId: usuario });
        checkReady();
      };
      
      useEffect(() => {
        checkReady();
        // Configura un intervalo para llamar a checkReady periódicamente
        const intervalId = setInterval(checkReady, 1000); // Por ejemplo, cada 2 segundos
      
        // Limpia el intervalo cuando el componente se desmonta
        return () => {
          clearInterval(intervalId);
        };
      }, []);
    


        const socket = io('http://localhost:3001', {
        query: { room } 
      });

        type DrawLineProps = {
        prevPoint: Point | null
        currentPoint: Point
        color: string
      }

        useEffect(()=>{
        const ctx = canvasRef.current?.getContext('2d')
        socket.emit('client-ready')
        socket.on('get-canvas-state',()=>{
            if(!canvasRef.current?.toDataURL()) return
            socket.emit('canvas-state',canvasRef.current.toDataURL())
        })

        socket.on('canvas-state-from-server',(state:string)=>{
            console.log('Recibiendo el estado')
            const img = new Image()
            img.src = state
            img.onload = ()=> {
                ctx?.drawImage(img,0,0)
            }
        })
        socket.on('draw-line',({prevPoint,currentPoint,color}:DrawLineProps)=>{
            if(!ctx) return
            drawLine({prevPoint,currentPoint,ctx,color})
        })

        socket.on('clear',clear)
        
        return () =>{
            socket.off('get-canvas-state')
            socket.off('canvas-state-from-server')
            socket.off('draw-line')
            socket.off('clear')

        }

       
    },[canvasRef])


    function createLine ({prevPoint,currentPoint,ctx}:Draw){
        socket.emit('draw-line',({prevPoint,currentPoint,color}))
        drawLine({prevPoint,currentPoint,ctx,color})
    }
return(
<div>
    <Navbar/>
    <button onClick={handleClick}>Listo</button>
<div className="w-screen h-screen bg-slate-500 flex justify-center items-center">
        <div className="flex flex-col gap-10 pr-10">
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)}/>
        <button onClick={()=>{
            socket.emit('clear')
        }} className="p-2 roun" type="button">Limpiar</button>
        </div>
         
    {ready && !startGame && <div>Esperando a otros jugadores...</div>}
      {ready && startGame && <div>Empezar juego!
        <canvas onMouseDown={onMouseDown} ref={canvasRef} width={750} height={750} className="border border-black rounded-md bg-white"/>
        </div>}
    
    </div>
</div>

)
}

export default page;