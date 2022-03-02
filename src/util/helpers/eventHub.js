export class eventHub {
  //任务队列
  task = {
    'click': [() => {
      console.log('第一个函数');
    }]
  };

  //发布任务
  $on(name, fn) {
    this.task[name] = this.task[name] || [];
    this.task[name].push(fn);
  }

//  订阅任务
  $emit(name, data) {
    const taskList = this.task[name];
    taskList.forEach(task => {
      task.call(undefined, data);
    });
  }

  $off(name, fn) {
    const taskList = this.task[name];
    const index = taskList.indexOf(fn);
    if (index < 0) {
      return;
    }
    this.task[name].splice(index, 1);
  }
}



