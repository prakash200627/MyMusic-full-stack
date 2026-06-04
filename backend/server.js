import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import songRouter from './src/routes/songRoute.js';
import albumRouter from './src/routes/albumRoute.js';
import authRouter from './src/routes/authRoute.js';
import adminRouter from './src/routes/adminRoute.js';
import userRouter from './src/routes/userRoute.js';
import analyticsRouter from './src/routes/analyticsRoute.js';
import apiRouter from './src/routes/apiRoute.js';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import { runStartupMigration } from './src/utils/migration.js';

//app config
const app = express();
const port = process.env.PORT || 4000;
connectDB().then(() => {
    runStartupMigration();
});
connectCloudinary();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors());

//initial routes
app.use('/api/song', songRouter);
app.use('/api/album', albumRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api', apiRouter);


app.get('/', (req, res) => res.send('API working'));

app.listen(port, () => console.log(`Server started on port ${port}`));