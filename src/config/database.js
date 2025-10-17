// developeric/codint_education/Codint_Education-backend/src/config/database.js

import mongoose from "mongoose";

// Cambio: Ahora exportamos con nombre (export const)
export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); //
        console.log('Base de datos online');
        //
        // await mongoose.connection.dropDatabase();
    } catch (error) {
        console.log(error);
        throw new Error('Error al iniciar la base de datos');
    }
};