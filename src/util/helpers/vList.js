/**
 * 虚拟滚动
 */

class Vlist {
  constructor(opts) {
    // mixin
    this.mixin(opts);

    const {
      initData,
      isDebounce
    } = opts;

    //初始化数据
    if (initData) {
      this.addData(initData);
    }

    this.scrollEventBind = this.scrollEvent.bind(this);

    // 绑定函数
    if (isDebounce) {
      this.container.addEventListener("scroll", (e) => {
        this.debounce(this.scrollEventBind, 40);
      });
    } else {
      this.container.addEventListener("scroll", this.scrollEventBind, false);
    }

  }

  /**
   * 配置mixin
   * @param {*} opts
   */
  mixin(opts) {
    let {
      itemHeight,
      container,
      containerContent,
      maxHeight,
      render,
      initData,
      itemEventHandlers,
      isDebounce
    } = opts;

    maxHeight = maxHeight ? maxHeight : document.documentElement.clientHeight;

    const _this = {
      itemHeight, // 每项高度
      container,  // 滚动容器
      containerContent, // 滚动内容
      maxHeight, // 出现滚动条的高度
      showItemCount: Math.ceil(maxHeight / itemHeight) + 1, // 视图区域显示item的个数
      items: [], // 可见列表项
      startIndex: 0, // 第一个item索引
      render, // 渲染每一项的函数
      data: [], // 列表数据
      itemEventHandlers, //事件处理
      isDebounce
    };

    Object.keys(_this).forEach(key => {
      this[key] = _this[key];
    });
  }

  /**
   * 防抖
   * @param {*} fn 处理方法
   * @param {*} interval 事件间隔
   */
  debounce(fn, interval) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      fn();
    }, interval);
  }

  /**
   * 渲染单行容器样式
   * @param {Object} dom内容
   * 最好是以template模板的形式，并加上事件
   */
  renderItem(item) {
    const index = item.index;

    // 此处应该配置
    const itemDom = item.dom ? item.dom : document.createElement("DIV");
    const itemData = this.data[index];
    // 填充
    itemDom.innerHTML = this.render(itemData, index);

    // 绑定事件，目前只支持item内class选择器
    this.itemEventHandlers.forEach((x, i) => {
      const targets = itemDom.querySelectorAll(`.${x.eventTargetClass}`);
      for (let j = 0; j < targets.length; j++) {
        targets[j].addEventListener(x.eventType, e => x.handler(e));
      }
    });

    // 设置高度
    itemDom.style.position = "absolute";
    itemDom.style.top = (index * this.itemHeight) + "px";
    itemDom.style.height = this.itemHeight + "px";
    itemDom.style.width = "100%";
    itemDom.style.overflow = "hidden";
    item.dom = itemDom;
    item.dom.setAttribute("index", index);
    item.top = index * this.itemHeight;
    return item;
  }


  /**
   * 初始化列表
   * 只根据startIndex渲染可视区范围的数据
   */
  initList() {
    const count = this.data.length < this.showItemCount ? this.data.length : this.showItemCount;
    for (let i = 0; i < count; i++) {
      const item = this.renderItem({
        index: i
      });
      this.containerContent.appendChild(item.dom);
      this.items.push(item);
    }
  }

  /**
   * 销毁列表dom和事件
   */
  destroy() {
    this.containerContent.innerHTML = '';
    this.data = [];
    this.items = [];
    this.startIndex = 0;
    this.container.removeEventListener("scroll", this.scrollEventBind, false);
  }


  /**
   * 重载列表dom和事件
   */
  reloadData = function (data) {
    this.destroy();
    this.addData(data);
  };

  /**
   * 添加数据
   * @param {*} data 所需添加的数据，在原基础上加
   */
  addData(data) {
    let isInit = this.data.length == 0;
    this.data = this.data.concat(data);
    const realHeight = parseInt(this.data.length * this.itemHeight);
    if (realHeight > this.maxHeight) {
      // 出现滚动条
      this.showItemCount = Math.ceil(this.maxHeight / this.itemHeight) * 3;//视图区域显示item的个数
      this.container.style.height = this.maxHeight + 'px';
    } else {
      // 支撑起内容高度，不触发滚动条
      this.container.style.height = realHeight + 'px';
      this.showItemCount = this.data.length + 1;//视图区域显示item的个数
    }

    this.containerContent.style.height = realHeight + 'px';

    if (isInit) {
      this.initList();
    }
  }

  /**
   * startIndex比较渲染
   * @param {*} startIndex
   * @param {*} startIndexNew
   */
  diffRender(startIndex, startIndexNew) {
    const showItemCount = this.showItemCount;

    const items = this.items;
    const moveCount = Math.abs(startIndex - startIndexNew);

    if (moveCount >= showItemCount) {
      // 全部渲染
      items.forEach((item, idx) => {
        item.index = startIndexNew + idx;
        this.renderItem(item);
      });
    } else {
      // 部分渲染
      if (startIndex - startIndexNew > 0) {
        // 往上滚
        for (let i = 1; i <= moveCount; i++) {
          let item = items[showItemCount - i];
          item.index = item.index - showItemCount;
          this.renderItem(item);
        }
        this.items = items.splice(showItemCount - moveCount, moveCount).concat(items);
      } else {
        for (let i = 0; i < moveCount; i++) {
          const item = items[i];
          item.index = item.index + showItemCount;
          this.renderItem(item);
        }
        this.items = items.concat(items.splice(0, moveCount));
      }
    }
  }

  /**
   * 滚动事件
   */
  scrollEvent() {
    const containerScrollTop = this.container.scrollTop;

    const {itemHeight, startIndex, maxHeight} = this;

    // 滚动触发计算
    const fakeStartIndex = Math.floor(containerScrollTop / itemHeight) - Math.ceil(maxHeight / itemHeight) - 1;
    let startIndexNew = fakeStartIndex >= 0 ? fakeStartIndex : 0;
    const maxStartIndex = this.data.length - this.showItemCount + 1;
    startIndexNew = startIndexNew > maxStartIndex ? maxStartIndex : startIndexNew;

    if (containerScrollTop < 0) return; // ios兼容
    if (startIndexNew === startIndex) return; // android兼容

    const scrollOver = startIndexNew + this.showItemCount - 1 >= this.data.length;
    const renderOver = startIndexNew - startIndex === 1;

    // 如果到底没有渲染完就再渲染一次
    if (scrollOver && renderOver === false) {
      startIndexNew--;
    }

    this.diffRender(startIndex, startIndexNew);
    this.startIndex = startIndexNew;
  }

}
