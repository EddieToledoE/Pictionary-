import express, { Request, Response } from "express";
const http = require("http");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
import { Server } from "socket.io";

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

type Point = { x: number; y: number };

type DrawLine = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

interface PlayerConnections {
  [key: string]: boolean;
}

let playerConnections: PlayerConnections = {};

io.on("connection", (socket) => {
  socket.on("client-ready", (room) => {
    socket.join(room);
    socket.to(room).emit("get-canvas-state");
  });

  playerConnections[socket.id] = true;

  socket.on("canvas-state", (state, room) => {
    console.log("Estado de la pizarra recibido");
    socket.to(room).emit("canvas-state-from-server", state);
  });

  socket.on(
    "draw-line",
    ({ prevPoint, currentPoint, color }: DrawLine, room) => {
      socket.to(room).emit("draw-line", { prevPoint, currentPoint, color });
    }
  );

  socket.on("clear", (room) => io.to(room).emit("clear"));

  socket.on("disconnect", () => {
    console.log("Disconect");
    playerConnections[socket.id] = false;
  });
});

app.get("/checkDisconnect", (req: Request, res: Response) => {
  const checkDisconnect = (
    resolve: (value: { gameEnded: boolean }) => void
  ) => {
    setTimeout(() => {
      const disconnected = Object.values(playerConnections).includes(false);
      resolve({ gameEnded: disconnected });
    }, 10000); // 30 segundos
  };

  new Promise(checkDisconnect).then((response) => res.json(response));
});

let readyUsers: string[] = [];

app.post("/ready", async (req, res) => {
  if (req.body && req.body.userId) {
    const { userId } = req.body;
    console.log(userId);
    console.log(readyUsers.length);
    if (!readyUsers.includes(userId)) {
      readyUsers.push(userId);
    }
  }

  res.json({ success: true });
});

app.get("/checkReady", (req, res) => {
  if (readyUsers.length >= 2) {
    res.json({ ready: true, startGame: true });
    //readyUsers.length = 0; // Vaciar el arreglo de usuarios listos
  } else {
    res.json({ ready: false });
  }
});

const correctAnswers: string[] = [
  "gato",
  "perro",
  "manzana",
  "sol",
  "luna",
  "silla",
  "mesa",
  "elefante",
  "guitarra",
  "libro",
  "montaña",
  "río",
  "coche",
  "tren",
  "árbol",
  "flor",
  "teléfono",
  "computadora",
  "reloj",
  "zapato",
  "sombrero",
  "pelota",
  "mariposa",
  "pez",
  "pájaro",
]; // Array de respuestas correctas

// Ruta para recibir respuestas y hacer long polling
app.post("/checkAnswer", (req, res) => {
  const { answer } = req.body;

  // Definiendo tipos para resolve y reject
  const waitForVerification = (
    resolve: (value: boolean) => void,
    reject: (reason?: any) => void
  ) => {
    if (correctAnswers.includes(answer)) {
      resolve(true);
    } else {
      resolve(false);
    }
  };

  new Promise<boolean>(waitForVerification)
    .then((isCorrect) => {
      if (isCorrect) {
        res.json({ isCorrect: true, message: "¡Respuesta correcta!" });
      } else {
        res.json({ isCorrect: false, message: "Respuesta incorrecta." });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Error interno del servidor" });
    });
});

server.listen(3001, () => {
  console.log("✔️ Server listening on port 3001");
});
