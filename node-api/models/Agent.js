import mongoose, { Schema } from "mongoose";  

const agentSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },

  age:{
    type: Number,
    min: 18,
    max: 130,
    index: true
  },
});

export const Agent = mongoose.model('Agent', agentSchema);

//Todo: Crear un controlador y una ruta para crear agentes via api/agents
