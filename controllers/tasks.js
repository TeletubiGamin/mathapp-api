
const handleTasks = (req, res, db) => {
    const {id} = req.body;
   db.select()
    .where({theme_id: id})
      .table('task')
        .orderBy([
          { column: 'task_level' }, 
          { column: 'task_id', order: 'asc' }
        ])
   .then(resp =>res.json(resp))
    .catch(err=> res.json(err))
};

const handleTaskPoint = (req, res, dba)=> {
  const {email, taskId} = req.body;
    if(!req.body.email)return res.json('annony')
  db('user')
    .returning('tasks_completed')
    .where('email', '=', email)
    .increment('tasks_completed', 1)
  .then(response=> res.json(response[0].tasks_completed))
  .catch(err => res.status(400).json(err))
}

const handleTaskAdd = (req, res, db) => {

  const {name, text, answer, theme, email, level} = req.body;
  if(!name || !text ||!answer || !theme || !email|| !level){
    return res.status(400).json('can dod this boss')
    }
  db.transaction(trx=>{
    trx.insert({
        task_name: name,
        task_text:text,
        task_answer:answer,
        theme_id: theme,
        user_email:email,
        task_level: level 
      })
    .into('task')
    .returning('user_email')
    .then(emaill=>{
      return trx.increment('tasks_added', 1)
        .into('user')
        .where('email', '=', emaill)
        .returning('tasks_added')
        .then(response=> res.json(response[0]))
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json(err));
}


module.exports = {
    handleTasks,
    handleTaskPoint,
    handleTaskAdd
};