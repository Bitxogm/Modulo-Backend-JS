// seedDB.js
import readline from 'node:readline/promises';

import { User } from "./models/User.js";
import { Agent } from "./models/Agent.js";
import { connectMongoose } from "./lib/connectMongoose.js";

const connection = await connectMongoose();
console.log(`✅ Connected to MongoDB: ${connection.name}`);

// Check de seguridad
const answer = await ask('🚫 Are you sure you want to delete all information of DB? [ y/N ] ');
if (answer !== 'y') {
  console.log('🚫 Seed cancelled');
  process.exit(0);
}

// ========================================
// SEED USERS
// ========================================
async function seedUsers() {
  console.log('\n🌱 Seeding Users...');
  
  const USERS = [
    { 
      name: 'User Test',  // ✅ CAMPO REQUERIDO
      email: 'user@example.com', 
      password: await User.hashPassword('Secreto123!'),  // ✅ hashPassword
      role: 'user' 
    },
    { 
      name: 'Admin Test',  // ✅ CAMPO REQUERIDO
      email: 'admin@example.com', 
      password: await User.hashPassword('Admin123!'),  // ✅ hashPassword
      role: 'admin' 
    },
  ];

  // Eliminar usuarios existentes
  const deletedResult = await User.deleteMany({});
  console.log(`🗑️  Deleted ${deletedResult.deletedCount} users`);

  // Insertar nuevos usuarios
  const insertedUsers = await User.insertMany(USERS);
  console.log(`✅ Inserted ${insertedUsers.length} users`);
  
  return insertedUsers;
}

// ========================================
// SEED AGENTS
// ========================================
async function seedAgents(users) {
  console.log('\n🌱 Seeding Agents...');
  
  // Usar el primer usuario como owner
  const ownerId = users[0]._id;
  
  const AGENTS = [
    { 
      name: 'James Bond', 
      email: '007@mi6.gov.uk',
      age: 35, 
      owner: ownerId 
    },
    { 
      name: 'Jason Bourne', 
      email: 'jason@cia.gov',
      age: 40, 
      owner: ownerId 
    },
    { 
      name: 'Ethan Hunt', 
      email: 'ethan@imf.gov',
      age: 42, 
      owner: ownerId 
    },
  ];

  // Eliminar agentes existentes
  const deletedResult = await Agent.deleteMany({});
  console.log(`🗑️  Deleted ${deletedResult.deletedCount} agents`);

  // Insertar nuevos agentes
  const insertedAgents = await Agent.insertMany(AGENTS);
  console.log(`✅ Inserted ${insertedAgents.length} agents`);
  
  return insertedAgents;
}

// ========================================
// EJECUTAR SEED
// ========================================
async function runSeed() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 Starting Database Seed');
    console.log('='.repeat(60));
    
    // 1. Seed users primero
    const users = await seedUsers();
    
    // 2. Seed agents después (necesitan users como owner)
    const agents = await seedAgents(users);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Seed completed successfully!');
    console.log('='.repeat(60));
    console.log(`👥 Users created: ${users.length}`);
    console.log(`   - ${users[0].email} (${users[0].role})`);
    console.log(`   - ${users[1].email} (${users[1].role})`);
    console.log(`\n🕵️  Agents created: ${agents.length}`);
    agents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.email})`);
    });
    console.log('='.repeat(60) + '\n');
    
    // Cerrar conexión
    await connection.close();
    console.log('👋 MongoDB connection closed\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Seed Error:', error.message);
    console.error(error.stack);
    
    await connection.close();
    process.exit(1);
  }
};

// function para preguntar por consolaç
async function  ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const result = await rl.question(question);
  rl.close();
  return result;
  
}

// Ejecutar
runSeed();