import express from 'express';
import {applyCors} from "./configuration/corsConfig.js";

const app=express();

applyCors(app); //cors 설정 적용

app.get('/', (req, res) => {
    res.send('8080 서버 응답');
});

export default app;