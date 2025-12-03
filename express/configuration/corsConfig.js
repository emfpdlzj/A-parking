import cors from "cors";

export const corsOptions = {
  origin: [
    "http://localhost:5173",       
    "https://a-parking.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

export const applyCors = (app) => {
  app.use(cors(corsOptions));
};