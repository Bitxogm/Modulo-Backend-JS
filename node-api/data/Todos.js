import jsonTodos from  './todos.json' with {type: 'json'} ;

export const todos = structuredClone(jsonTodos);