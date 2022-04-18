/**
 * 使用setTimeout代替setInterval  因为setInterval存在一些问题。想了解的搜百度
 * 用法 设置循环定时器 mysetInterval(foo,1000)//1s执行一次
 * created by wangshiyang    2022.01.10
 */

function mySetInterval(fn, wait, count) {
  const that = this;

  function interval() {
    if (typeof count === 'undefined' || count-- > 0) {
      setTimeout(interval, wait);
      try {
        fn.call(that);
      } catch (e) {
        count = 0;
        throw e.toString();
      }
    }
  }

  setTimeout(interval, wait);
}

export default mySetInterval;
