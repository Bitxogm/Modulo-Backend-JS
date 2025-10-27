import json from './users.json' with { type: 'json' };

// Nos clonamos todo el JSON para tener una copia en memoria
// a la que podemos hacer modificaciones
// y simular una "base de datos"
//! Esto no persiste los datos. Cada vez que reiniciemos la app
//! volveremos a tener los datos originales
export const users = structuredClone(json);