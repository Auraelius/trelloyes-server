// This is a temporary data structure to stand in for a database.
// When you restart the server, it will revert to these values

const cards = [{
    id: 1,
    title: 'Task One',
    content: 'This is card one'
  },
  {
   id: 2,
   title: 'Task Two',
   content: 'This is card two'
 }];
  
  const lists = [{
     id: 1,
     header: 'List One',
     cardIds: [1, 2]
  }];

  module.exports = { cards, lists }