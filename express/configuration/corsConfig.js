import cors from "cors";

export const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

export const applyCors = (app) => {
  app.use(cors(corsOptions));
};
