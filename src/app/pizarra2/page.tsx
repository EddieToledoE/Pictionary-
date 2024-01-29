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
    const [room, setRoom] = useState<string>("room2"); 
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
       const response =  await axios.post('http://localhost:3001/ready', { userId: usuario });
        if (response.data.ready) { setReady(true);}
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


      useEffect(() => {
        const checkDisconnect = async () => {
          try {
            const response = await axios.get<{ gameEnded: boolean }>('http://localhost:3001/checkDisconnect', { timeout: 35000 });
            if (response.data.gameEnded) {
              alert("El juego ha finalizado debido a la desconexión de un jugador.");
            }
          } catch (error) {
            console.error('Error en long polling:', error);
          }
        };
    
        checkDisconnect();
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

    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');

    const checkAnswer = async () => {
        try {
            const response = await axios.post('http://localhost:3001/checkAnswer', {
                answer: userAnswer
            }, {
                timeout: 0 // Evita el timeout para long polling
            });

            if (response.data.isCorrect) {
                setFeedback('¡Respuesta correcta!');
            } else {
                setFeedback('Respuesta incorrecta, intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error en long polling:', error);
            setFeedback('Error al verificar la respuesta, intenta de nuevo.');
            setTimeout(checkAnswer, 3000); // Reintentar después de 3 segundos
        }
    };

    const getRandomWords = (words, count) => {
        let shuffled = [...words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    const wordPool = ['gato', 'perro', 'manzana', 'sol', 'luna', 'silla', 'mesa', 'elefante', 'guitarra', 'libro', 'montaña', 'río', 'coche', 'tren', 'árbol', 'flor', 'teléfono', 'computadora', 'reloj', 'zapato', 'sombrero', 'pelota', 'mariposa', 'pez', 'pájaro'];
    const [randomWords, setRandomWords] = useState([]);

    const handleGetWords = () => {
        const selectedWords = getRandomWords(wordPool, 5);
        setRandomWords(selectedWords);
    };
return(
<div >
    
    <Navbar/>
    <div className="justify-center items-center p-6">
    <button 
    onClick={handleClick} 
    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
>
    Listo
</button>

{!ready && !startGame && (
    <div className="bg-black opacity-75  top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center">
        <span className="text-white text-xl">Cargando...</span>
    </div>
)}

{ready && startGame && (
    <div className="text-green-500 text-xl font-bold my-4">
        ¡Juego comenzado!
        <div className="p-4">
            <button 
                onClick={handleGetWords}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
                Obtener Palabras
            </button>

            <div className="mt-4">
                {randomWords.map((word, index) => (
                    <div key={index} className="text-lg text-gray-700 p-2">
                        {word}
                    </div>
                ))}
            </div>
        </div>
        <div className="mt-4">
    <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Escribe tu respuesta aquí"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
    <button 
        onClick={checkAnswer} 
        className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300 mt-2"
    >
        Enviar Respuesta
    </button>
    <div className="mt-2 text-blue-600">
        {feedback}
    </div>
</div>
    </div>
    
)}


    


    </div>

    <div className="w-screen h-screen bg-slate-500 flex justify-center items-center">
        <div className="flex flex-col gap-10 pr-10">

        <ChromePicker color={color} onChange={(e) => setColor(e.hex)}/>
        <button onClick={()=>{
            socket.emit('clear')
        }} className="p-2 roun" type="button">Limpiar</button>
        </div>
        <canvas onMouseDown={onMouseDown} ref={canvasRef} width={750} height={750} className="border border-black rounded-md bg-white"/>
    
    
    </div>
</div>
    
)
}

export default page;