// 使用浏览器的indexedDb存储数据量比较大的数据做缓存
import {message} from 'ant-design-vue';

export default class indexedDBHelper {
  db = null;
  //打开数据库
  OpenDB = (database, tableName) => {
    //打开数据库[open(参数1，参数2) 参数1：表示数据库名称 参数2：表示数据库版本] 如果没有就会新建一个
    let resquest = window.indexedDB.open(database, 1); //返回IDBRequest 对象，IDBRequest 对象 三个事件：error、success、upgradeneeded
    resquest.onerror = () => {
      //error失败事件
    };
    resquest.onupgradeneeded = (event) => {
      this.db = event.target.result; //获取数据库实例对象
      let objectstore = this.CreateTable(tableName, {
        autoIncrement: true
      }, "test");
    };
    resquest.onsuccess = (event) => {
      //success成功事件
      this.db = event.target.result; //获取数据库实例对象
    };
  };

  CreateTable = (tableName, pk) => {
    if (this.db) {
      if (!this.db.objectStoreNames.contains(tableName)) {
        //pk:{ keyPath: 'id' } 表示主键为ID
        //pk:{ autoIncrement: true } 表示主键自增长
        //pk:{keyPath:'foo.bar'}主键也可以指定为下一层对象的属性，比如{ foo: { bar: 'baz' } }的foo.bar也可以指定为主键。
        return this.db.createObjectStore(tableName, pk); //返回表对象
      }
    }
  };

  CreateIndex = (objectstore) => {
    //createIndex()的三个参数分别为索引名称、索引所在的属性、配置对象（说明该属性是否包含重复的值）
    objectstore.createIndex('id', 'ID', {
      unique: true
    });
  };

  AddData = (tableName, data) => {
    let request = this.db.transaction([tableName], 'readwrite')
      .objectStore(tableName)
      .add(data);

    request.onsuccess = (event) => {
      message.success('数据写入成功');
    };

    request.onerror = (event) => {
      message.error('数据写入失败');
    };
  };

  EditData = (tableName, data) => {
    let request = this.db.transaction([tableName], 'readwrite')
      .objectStore(tableName)
      .put(data);

    request.onsuccess = (event) => {
      message.success('数据更新成功');
    };

    request.onerror = (event) => {
      message.error('数据更新失败');
    };
  };

  ReadData = (tableName, cb) => {
    //获取单条数据
    //get(参数1) ； 参数1：键值
    let request = this.db.transaction([tableName]).objectStore(tableName).get(1);
    request.onerror = (event) => {
      message.error('事务失败');
    };
    request.onsuccess = (event) => {
      if (request.result) {
        cb(request.result);
      } else {
        cb('dataEmpty');
      }
    };
  };

  ReadAllData = (tableName, count, cb) => {
    !Object.values(this.db.objectStoreNames).includes(tableName) && message.error('数据表不存在，请刷新页面重新开启数据库');
    ///获取所有数据
    let objectStore = this.db.transaction([tableName]).objectStore(tableName);
    objectStore.openCursor().onsuccess = (event) => {
      let cursor = event.target.result;
      if (cursor === null) {
        message.warn('请先同步数据至本地');
      }
      if (cursor) {
        count === 0 && cb(cursor.value);
        // cursor.continue();
      } else {
        message.warn('没有更多数据了！');
      }
    };
  };

  DelData = (tableName, key) => {
    ///删除数据
    let request = this.db.transaction([tableName], 'readwrite')
      .objectStore(tableName)
      .delete(key); //删除主键为key的数据

    request.onsuccess = (event) => {
      message.success('数据删除成功');
    };
  };

  Clear = (tableName) => {
    ///清空数据
    if(this.db){
      let transaction = this.db.transaction([tableName], 'readwrite');
      let store = transaction.objectStore(tableName);
      store.clear();
    }
  };

  DelObjectStore = (tableName) => {
    ///删除表[执行此全动作必须发生在版本变更动作中]
    this.db.deleteObjectStore(tableName);
  };

  DelDB = (database) => {
    ///删除库
    window.indexedDB.deleteDatabase(database);
  };
}
