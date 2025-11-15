
import express from 'express';
import cors from 'cors';
import 'dotenv/config';



const PORT = parseInt(process.env.PORT || '3000');

const app = express();

app.use(express.json());
app.use(cors());

app.listen(PORT,'0.0.0.0',err => {
    if (err){
        console.error(err);
    }
    else{
        console.log('Server Listenning on port '+PORT);
    }
});

