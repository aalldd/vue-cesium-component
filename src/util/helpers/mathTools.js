class mathTools {
  constructor() {
  }

  // 计算两根线之间的夹角
  CalAngleInFace = (i,linePoint) => {
    const v1 = this.Subtract(linePoint[i + 1], linePoint[i]);
    const v3 = this.Subtract(linePoint[i + 2], linePoint[i + 1]);
    let flag = this.Cross(this.Normal(v1), this.Normal(v3))[2] < 0;

    const v4 = flag ? this.Subtract(linePoint[i + 2], linePoint[i + 1]) : this.Subtract(linePoint[i + 1], linePoint[i + 2]);
    const v5 = flag ? this.Subtract(linePoint[i], linePoint[i + 1]) : v1;
    const v6 = this.Add(this.Normal(v4), this.Normal(v5));

    const angle = flag ? this.AngleR(v6, v1) - Math.PI / 2 : Math.PI / 2 - this.AngleR(v6, v1);
    return [v6, angle];
  };

  Add = (a, b) => {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  };

  AngleR = (a, b) => {
    const l1 = this.Length(a);
    const l2 = this.Length(b);
    let t = this.Dot(a, b) / (l1 * l2);
    if (t > 1) t = 1;
    else if (t < -1) t = -1;
    return Math.acos(t);
  };

  // 向量叉乘
  Cross = (a, b) => {
    return [a[1] * b[2] - b[1] * a[2], a[2] * b[0] - b[2] * a[0], a[0] * b[1] - b[0] * a[1]];
  };

  // 向量点乘
  Dot = (a, b) => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  };

  // 单位矩阵
  Normal = (a) => {
    let l = this.Length(a);
    return [a[0] / l, a[1] / l, a[2] / l];
  };

  Length = (a) => {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  };

  PVL = (p, v, l) => {
    let v0 = this.Normal(v);
    return [p[0] + v0[0] * l, p[1] + v0[1] * l, p[2] + v0[2] * l];
  };

  Subtract = (a, b) => {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  };
}

export default new mathTools();
