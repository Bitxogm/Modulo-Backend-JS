import { Agent } from '../models/Agent.js'; 

export const agentController  =  {
  add: async (req, res, next) => {
    const agent = new Agent({
      name: req.body.name,
      age: req.body.age,
      owner: req.body.owner
    });
    try {
      const savedAgent = await agent.save();
      res.status(201).json(savedAgent);
    } catch (error) {
      res.status(500).json({message: 'Internal Server Error'})
    }
  }
}
  