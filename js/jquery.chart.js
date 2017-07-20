(function ($, undefined) {
  'use strict';

  /* 默认参数  */
  var defaultParameters = {
    global: { // 全局
      font: 10,
      color: 'black',
      event: 'tap'
    },
    grid: { // 网格
      top: 40,
      right: 50,
      bottom: 60,
      left: 50
    },
    scale: { // 刻度
      show: false,
      space: 5,
      length: 5,
      textColor: '#999',
      unitsColor: '#999',
      x: {},
      y: {}
    },
    auxiliaryLine: { // 辅助线
      show: true,
      style: 'dashed',
      color: 'silver'
    },
    legend: { // 图例
      show: true,
      position: 'bottom'
    },
    toolTip: { // 提示
      show: true,
      color: 'white',
      lineColor: '#f0f0f0',
      bgColor: 'rgba(0,0,0,.5)'
    },
    xAxis: {
      show: true,
      data: []
    },
    yAxis: [],
    series: []
  };

  var ViewSize = 2; // 视图大小(实际大小/显示大小)

  /* Catmull-Rom spline 样条曲线  */
  function catmullRom(cxt, p0, p1, p2, p3, count) {
    var t0 = 0;
    var t1 = getTime(t0, p0, p1);
    var t2 = getTime(t1, p1, p2);
    var t3 = getTime(t2, p2, p3);
    for (var t = t1; t < t2; t += (t2 - t1) / count) {
      var a1 = getPoint(p0, p1, t0, t1, t);
      var a2 = getPoint(p1, p2, t1, t2, t);
      var a3 = getPoint(p2, p3, t2, t3, t);
      var b1 = getPoint(a1, a2, t0, t2, t);
      var b2 = getPoint(a2, a3, t1, t3, t);
      var c = getPoint(b1, b2, t1, t2, t);
      cxt.beginPath();
      cxt.arc(c.x, c.y, 1, 0, 2 * Math.PI);
      cxt.closePath();
      cxt.fill();
    }
  };

  /* 获取关键点  */
  function getPoint(p1, p2, t1, t2, t) {
    var p = {
      x: (t2 - t) / (t2 - t1) * p1.x + (t - t1) / (t2 - t1) * p2.x,
      y: (t2 - t) / (t2 - t1) * p1.y + (t - t1) / (t2 - t1) * p2.y
    };
    return p;
  };

  /* 获取关键时间  */
  function getTime(t, p0, p1) {
    var a = Math.pow((p1.x - p0.x), 2) + Math.pow((p1.y - p0.y), 2);
    var b = Math.pow(a, 0.5);
    var c = Math.pow(b, 0.5);
    return (c + t);
  };

  /* 获取数组中的最大值  */
  function getArrayMaxValue(array) {
    var maxVal = Number.MIN_VALUE;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > maxVal) {
        maxVal = array[i];
      }
    }
    return maxVal;
  };

  /* 获取数组中的最小值  */
  function getArrayMinValue(array) {
    var minVal = Number.MAX_VALUE;
    for (var i = 0; i < array.length; i++) {
      if (array[i] < minVal) {
        minVal = array[i];
      }
    }
    return minVal;
  };

  /* 获得最小刻度值 */
  function getMinScale(unitSize, minVal, i) {
    var i = i || 0;
    if (i * unitSize >= minVal) {
      return (i - 1) * unitSize;
    } else {
      i++;
      return getMinScale(unitSize, minVal, i);
    }
  };

  /* 获得每一个刻度值大小 */
  function getScaleSize(unitSize, scaleNumber, minScale, maxVal, i) {
    var i = i || 0;
    if (i * unitSize * scaleNumber + minScale > maxVal) {
      return i * unitSize;
    } else {
      i++;
      return getScaleSize(unitSize, scaleNumber, minScale, maxVal, i);
    }
  };

  /* 绘制圆角矩形  */
  function drawFillet(cxt, x, y, width, height, radius) {
    cxt.beginPath();
    cxt.moveTo(x + radius, y);
    cxt.lineTo(x + width - radius, y);
    cxt.arcTo(x + width, y, x + width, y + radius, radius);
    cxt.lineTo(x + width, y + height - radius);
    cxt.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    cxt.lineTo(x + radius, y + height);
    cxt.arcTo(x, y + height, x, y + height - radius, radius);
    cxt.lineTo(x, y + radius);
    cxt.arcTo(x, y, x + radius, y, radius);
    cxt.closePath();
  };

  /* 绘制虚线  */
  function fillDashedLine(cxt, x, y, width) {
    for (var i = 0; i < width; i += 12) {
      cxt.fillRect(x + i, y, 6, 1);
    }
  };

  /* 绘制点线  */
  function fillDottedLine(cxt, x, y, width) {
    for (var i = 0; i < width; i += 4) {
      cxt.fillRect(x + i, y, 2, 1);
    }
  };

  /* fontSize */
  function getFontSize(size, n) {
    return size * n + 'px PingFang SC,Noto Sans CJK SC,Microsoft YaHei,arial,helvetica,tahoma,verdana,sans-serif';
  };

  /* 绘制X轴  */
  function drawXAxis(c, cxt, opts) {
    var b = typeof (opts.xAxis.show) === 'undefined' ? true : opts.xAxis.show;
    if (b) {
      var _rect = {
        x: opts.grid.left,
        y: c.height - opts.grid.bottom,
        width: c.width - opts.grid.right - opts.grid.left + 1, // '+1'y右轴的宽度
        height: 1
      };
      cxt.fillStyle = opts.xAxis.color || opts.global.color;
      cxt.fillRect(_rect.x, _rect.y, _rect.width, _rect.height);
    }
  };

  /* 绘制X轴刻度  */
  function drawXAxisScale(c, cxt, opts, data) {
    var b = true;
    if (typeof (opts.scale.x.show) !== 'undefined') {
      b = opts.scale.x.show;
    } else if (typeof (opts.scale.show) !== 'undefined') {
      b = opts.scale.show;
    }
    var scaleLength = (opts.scale.x.length || opts.scale.length || 5) * ViewSize;
    var scaleSpace = (opts.scale.x.space || opts.scale.space || 5) * ViewSize;
    for (var i = 0; i < data.length; i++) {
      if (b) {
        var _rect = {
          x: Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / data.length * (i + 0.5)),
          y: Math.round(c.height - opts.grid.bottom) + 1, // '+1'x轴的高度
          width: 1,
          height: scaleLength
        };
        cxt.fillStyle = opts.scale.x.color || opts.scale.color || opts.global.color;
        cxt.fillRect(_rect.x, _rect.y, _rect.width, _rect.height);
      }
      var _text = {
        txt: data[i],
        x: Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / data.length * (i + 0.5)),
        y: Math.round(c.height - opts.grid.bottom) + scaleLength + scaleSpace
      };
      cxt.font = getFontSize(opts.scale.x.font || opts.scale.font || opts.global.font, ViewSize);
      cxt.fillStyle = opts.scale.x.textColor || opts.scale.textColor || opts.global.color;
      cxt.textAlign = 'center';
      cxt.textBaseline = 'top';
      cxt.fillText(_text.txt, _text.x, _text.y);
    }
  };

  /* 绘制Y轴  */
  function drawYAxis(c, cxt, opts, n) {
    var b = typeof (opts.yAxis[n].show) === 'undefined' ? true : opts.yAxis[n].show;
    if (b) {
      var _rect = {
        x: opts.grid.left,
        y: opts.grid.top,
        width: 1,
        height: c.height - opts.grid.bottom - opts.grid.top
      };
      if (n) {
        _rect.x = c.width - opts.grid.right;
      }
      cxt.fillStyle = opts.yAxis[n].color || opts.global.color;
      cxt.fillRect(_rect.x, _rect.y, _rect.width, _rect.height);
    }
  };

  /* 绘制Y轴刻度  */
  function drawYAxisScale(c, cxt, opts, n, scaleNumber, scaleSize, minScale) {
    var b = true;
    if (typeof (opts.scale.y.show) !== 'undefined') {
      b = opts.scale.y.show;
    } else if (typeof (opts.scale.show) !== 'undefined') {
      b = opts.scale.show;
    }
    var scaleLength = (opts.scale.y.length || opts.scale.length || 5) * ViewSize;
    var scaleSpace = (opts.scale.y.space || opts.scale.space || 5) * ViewSize;
    for (var i = 0; i <= scaleNumber; i++) {
      if (b) {
        var _rect = {
          x: Math.round(opts.grid.left - scaleLength),
          y: Math.round(opts.grid.top + (c.height - opts.grid.bottom - opts.grid.top) / scaleNumber * i),
          width: scaleLength,
          height: 1
        };
        if (n) {
          _rect.x = Math.round(c.width - opts.grid.right) + 1; // '+1'y右轴宽度
        }
        cxt.fillStyle = opts.scale.y.color || opts.scale.color || opts.global.color;
        cxt.fillRect(_rect.x, _rect.y, _rect.width, _rect.height);
      }
      var _text = {
        txt: (scaleNumber - i) * scaleSize + minScale,
        x: Math.round(opts.grid.left - scaleLength - scaleSpace),
        y: Math.round(opts.grid.top + (c.height - opts.grid.bottom - opts.grid.top) / scaleNumber * i)
      };
      cxt.font = getFontSize(opts.scale.y.font || opts.scale.font || opts.global.font, ViewSize);
      cxt.textBaseline = 'middle';
      cxt.textAlign = 'right';
      cxt.fillStyle = opts.scale.y.textColor || opts.scale.textColor || opts.global.color;
      if (n) {
        cxt.textAlign = 'left';
        _text.x = Math.round(c.width - opts.grid.right + scaleLength + scaleSpace) + 1; // '+1'y右轴宽度
      }
      cxt.fillText(_text.txt, _text.x, _text.y);
    }
  };

  /* 绘制辅助线  */
  function drawAuxiliaryLine(c, cxt, opts, scaleNumber) {
    var b = typeof (opts.auxiliaryLine.show) === 'undefined' ? true : opts.auxiliaryLine.show;
    if (b) {
      for (var i = 0; i <= scaleNumber; i++) {
        var _line = {
          x: opts.grid.left,
          y: Math.round(opts.grid.top + (c.height - opts.grid.bottom - opts.grid.top) / scaleNumber * i),
          width: c.width - opts.grid.right - opts.grid.left
        }
        cxt.fillStyle = opts.auxiliaryLine.color;
        cxt.globalCompositeOperation = 'destination-over';
        switch (opts.auxiliaryLine.style) {
          case 'solid':
            cxt.fillRect(_line.x, _line.y, _line.width, 1);
            break;
          case 'dotted':
            fillDottedLine(cxt, _line.x, _line.y, _line.width);
            break;
          case 'dashed':
          default:
            fillDashedLine(cxt, _line.x, _line.y, _line.width);
            break;
        }
      }
    }
  };

  /* 绘制单位 */
  function drawUnits(c, cxt, opts, n) {
    var scaleLength = (opts.scale.y.length || opts.scale.length || 5) * ViewSize;
    var scaleSpace = (opts.scale.y.space || opts.scale.space || 5) * ViewSize;
    cxt.font = getFontSize(opts.scale.y.font || opts.scale.font || opts.global.font, ViewSize);
    cxt.textBaseline = 'middle';
    cxt.textAlign = 'right';
    cxt.fillStyle = opts.scale.y.unitsColor || opts.scale.unitsColor || opts.global.color;
    var _text = {
      txt: opts.series[n].units || '',
      x: Math.round(opts.grid.left - scaleLength - scaleSpace),
      y: Math.round(opts.grid.top - 20 * ViewSize)
    };
    if (n) {
      cxt.textAlign = 'left';
      _text.x = Math.round(c.width - opts.grid.right + scaleLength + scaleSpace);
    }
    cxt.fillText(_text.txt, _text.x, _text.y);
  };

  /* 绘制图示  */
  function drawLegend(c, cxt, opts) {
    var b = typeof (opts.legend.show) === 'undefined' ? true : opts.legend.show;
    if (b) {
      cxt.font = getFontSize(opts.legend.font || opts.global.font) * ViewSize;
      cxt.textAlign = 'left';
      cxt.textBaseline = 'top';
      var left = c.width * 0.5;
      for (var i = 0; i < opts.series.length; i++) {
        left -= (cxt.measureText(opts.series[i].name).width + 20 * ViewSize) * 0.5;
      };
      for (var i = 0; i < opts.series.length; i++) {
        var top = c.height - 20 * ViewSize;
        if (opts.legend.position !== 'bottom') {
          top = 5 * ViewSize;
        }
        cxt.strokeStyle = opts.series[i].color;
        cxt.fillStyle = opts.series[i].color;
        cxt.beginPath();
        cxt.arc(left + 9 * ViewSize, top + 8 * ViewSize, 8, 0, 2 * Math.PI);
        cxt.closePath();
        cxt.stroke();
        cxt.fill();
        left += 20 * ViewSize;
        cxt.fillStyle = opts.legend.color || opts.global.color;
        cxt.fillText(opts.series[i].name, left, top);
        left += cxt.measureText(opts.series[i].name).width + 7 * ViewSize;
      };
    }
  };

  /* 绘制柱状图  */
  function drawBarChart(c, cxt, opts, series, minScale, maxScale) {
    for (var i = 0; i < series.data.length; i++) {
      var wid = (series.width || 10) * ViewSize;
      var val = (series.data[i] - minScale) * (c.height - opts.grid.bottom - opts.grid.top) / maxScale;
      var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / series.data.length * (i + 0.5) - wid * 0.5);
      var top = Math.round(c.height - opts.grid.bottom - val);
      cxt.globalCompositeOperation = 'source-over';
      cxt.fillStyle = series.color || 'black';
      cxt.fillRect(left, top, wid, val);
    }
  };

  /* 绘制折线图 */
  function drawLineChart(c, cxt, opts, series, minScale, maxScale) {
    cxt.globalCompositeOperation = 'source-over';
    cxt.fillStyle = series.color || 'black';
    var points = [];
    for (var i = 0; i < series.data.length; i++) {
      var val = (series.data[i] - minScale) * (c.height - opts.grid.bottom - opts.grid.top) / maxScale;
      var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / series.data.length * (i + 0.5));
      var top = Math.round(c.height - opts.grid.bottom - val);
      cxt.beginPath();
      cxt.arc(left, top, 5, 0, 2 * Math.PI);
      cxt.closePath();
      cxt.fill();
      points.push({
        x: left,
        y: top
      });
    }
    var p0 = {
      x: points[0].x - 100,
      y: points[0].y
    };
    var p1 = {
      x: points[points.length - 1].x + 100,
      y: points[points.length - 1].y
    };
    for (var i = 0; i < points.length - 1; i++) {
      if (i === 0) { // 前三点加P0
        catmullRom(cxt, p0, points[i], points[i + 1], points[i + 2], 1000);
      } else if (i === points.length - 2) { // 后三点加P1
        catmullRom(cxt, points[i - 1], points[i], points[i + 1], p1, 1000);
      } else {
        catmullRom(cxt, points[i - 1], points[i], points[i + 1], points[i + 2], 1000);
      }
    }
  };

  /* 绘制提示工具  */
  function drawTooltip(c, cxt, opts, x, y) {
    var b = typeof (opts.toolTip.show) === 'undefined' ? true : opts.toolTip.show;
    if (b) {
      var x = x * ViewSize;
      var y = y * ViewSize;
      for (var i = 0; i < opts.xAxis.data.length; i++) {
        var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / opts.xAxis.data.length * i);
        var center = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / opts.xAxis.data.length * (i + 0.5));
        var right = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / opts.xAxis.data.length * (i + 1));
        var top = opts.grid.top;
        var bottom = c.height - opts.grid.bottom;
        if (x > left && x < right && y > top && y < bottom) {
          cxt.fillStyle = opts.toolTip.lineColor;
          cxt.font = getFontSize(opts.toolTip.font || opts.global.font, ViewSize);
          //cxt.fillRect(left, top, right - left, bottom - top);
          cxt.fillRect(center, top, 1, bottom - top);
          var toolLeft = center + 10 * ViewSize;
          var toolTop = y;
          var toolWidth = cxt.measureText(opts.xAxis.data[i]).width + 30 * ViewSize;
          var toolHeight = 25 * ViewSize;
          var toolText = [opts.xAxis.data[i]];
          var toolArc = [];
          for (var j = 0; j < opts.series.length; j++) {
            var num = cxt.measureText(opts.series[j].name + ' : ' + opts.series[j].data[i] + opts.series[j].units).width + 30 * ViewSize;
            if (num > toolWidth) {
              toolWidth = num;
            }
            toolText.push(opts.series[j].name + ' : ' + opts.series[j].data[i] + opts.series[j].units);
            toolArc.push({
              x: toolLeft + 10 * ViewSize,
              y: toolTop + 25 * ViewSize + j * 15 * ViewSize + 4,
              r: 3 * ViewSize,
              color: opts.series[j].color
            });
            toolHeight += 15 * ViewSize;
          }
          if (toolLeft + toolWidth > c.width - opts.grid.right) {
            toolLeft = toolLeft - toolWidth - 20 * ViewSize;
            for (var k in toolArc) {
              toolArc[k].x = toolLeft + 10 * ViewSize;
            }
          }
          if (toolTop + toolHeight > c.height - opts.grid.bottom) {
            toolTop = toolTop - toolHeight - 10;
            for (var k in toolArc) {
              toolArc[k].y = toolTop + 25 * ViewSize + k * 15 * ViewSize + 4;
            }
          }
          cxt.fillStyle = opts.toolTip.bgColor;
          drawFillet(cxt, toolLeft, toolTop, toolWidth, toolHeight, 3);
          cxt.fill();
          cxt.font = getFontSize(opts.toolTip.font || opts.global.font, ViewSize);
          cxt.textAlign = 'left';
          cxt.textBaseline = 'top';
          for (var k in toolText) {
            var _left = toolLeft + 5 * ViewSize;
            if (k != 0) {
              _left = toolLeft + 16 * ViewSize;
            }
            cxt.fillStyle = opts.toolTip.color;
            cxt.fillText(toolText[k], _left, toolTop + k * 15 * ViewSize + 5 * ViewSize);
          }
          for (var k in toolArc) {
            cxt.fillStyle = toolArc[k].color;
            cxt.beginPath();
            cxt.arc(toolArc[k].x, toolArc[k].y, toolArc[k].r, 0, 2 * Math.PI);
            cxt.closePath();
            cxt.fill();
          }
        }
      }
    }
  };

  /* 绘制图表  */
  function initChart() {
    var _scaleNumberArray = []; // 刻度数
    var _unitSizeArray = []; // 单元大小
    var _zeroScaleArray = []; // 是否从0开始
    var _maxValArray = []; // 最大值
    var _minValArray = []; // 最小值
    var _minScaleArray = []; // 最小刻度值
    var _scaleSizeArray = []; // 每刻度之间大小
    var _maxScaleArray = []; // 最大刻度值

    this.cxt.clearRect(0, 0, this.c.width, this.c.height); // 清空画布
    if (this.opts.xAxis.data.length) {
      drawXAxis(this.c, this.cxt, this.opts);
      drawXAxisScale(this.c, this.cxt, this.opts, this.opts.xAxis.data);
    }
    if (this.opts.yAxis.length && this.opts.series.length) {
      for (var i = 0; i < this.opts.yAxis.length; i++) {
        _zeroScaleArray[i] = typeof (this.opts.yAxis[i].zeroScale) === 'undefined' ? true : this.opts.yAxis[i].zeroScale;
        _scaleNumberArray[i] = typeof (this.opts.yAxis[i].scaleNumber) === 'undefined' ? 5 : this.opts.yAxis[i].scaleNumber;
        _unitSizeArray[i] = typeof (this.opts.yAxis[i].unitSize) === 'undefined' ? 10 : this.opts.yAxis[i].unitSize;
      };
      if (this.opts.yAxis.length > 1) {
        for (var i = 0; i < this.opts.series.length; i++) {
          _maxValArray[i] = getArrayMaxValue(this.opts.series[i].data);
          _minValArray[i] = getArrayMinValue(this.opts.series[i].data);
          _minScaleArray[i] = _zeroScaleArray[i] ? 0 : getMinScale(_unitSizeArray[i], _minValArray[i]);
          _scaleSizeArray[i] = getScaleSize(_unitSizeArray[i], _scaleNumberArray[i], _minScaleArray[i], _maxValArray[i]);
          _maxScaleArray[i] = _scaleNumberArray[i] * _scaleSizeArray[i];
        }
      } else {
        var _newSeriesData = [];
        for (var i = 0; i < this.opts.series.length; i++) {
          _newSeriesData = _newSeriesData.concat(this.opts.series[i].data);
        }
        for (var i = 0; i < this.opts.series.length; i++) {
          _maxValArray[i] = getArrayMaxValue(_newSeriesData);
          _minValArray[i] = getArrayMinValue(_newSeriesData);
          _minScaleArray[i] = _zeroScaleArray[0] ? 0 : getMinScale(_unitSizeArray[0], _minValArray[i]);
          _scaleSizeArray[i] = getScaleSize(_unitSizeArray[0], _scaleNumberArray[0], _minScaleArray[i], _maxValArray[i]);
          _maxScaleArray[i] = _scaleNumberArray[0] * _scaleSizeArray[i];
        }
      }
      for (var i = 0; i < this.opts.yAxis.length; i++) {
        drawYAxis(this.c, this.cxt, this.opts, i);
        drawUnits(this.c, this.cxt, this.opts, i);
        drawAuxiliaryLine(this.c, this.cxt, this.opts, _scaleNumberArray[i]);
        drawYAxisScale(this.c, this.cxt, this.opts, i, _scaleNumberArray[i], _scaleSizeArray[i], _minScaleArray[i]);
      }
      for (var i = 0; i < this.opts.series.length; i++) {
        switch (this.opts.series[i].type) {
          case 'line':
            drawLineChart(this.c, this.cxt, this.opts, this.opts.series[i], _minScaleArray[i], _maxScaleArray[i]);
            break;
          case 'bar':
          default:
            drawBarChart(this.c, this.cxt, this.opts, this.opts.series[i], _minScaleArray[i], _maxScaleArray[i]);
            break;
        }
      }
    }
    drawLegend(this.c, this.cxt, this.opts); // 图例
  };

  /* 初始化事件 */
  function initEvent() {
    var _this = this;
    this.$el.on(this.opts.global.event, function (e) {
      var x = e.pageX - $(this).offset().left;
      var y = e.pageY - $(this).offset().top;
      initChart.call(_this);
      drawTooltip(_this.c, _this.cxt, _this.opts, x, y);
    });
  };

  /* 图表 */
  function Chart($el, options) {
    this.opts = {};
    this.opts.global = $.extend({}, defaultParameters.global, options.global);
    this.opts.grid = $.extend({}, defaultParameters.grid, options.grid);
    this.opts.scale = $.extend({}, defaultParameters.scale, options.scale);
    this.opts.auxiliaryLine = $.extend({}, defaultParameters.auxiliaryLine, options.auxiliaryLine);
    this.opts.legend = $.extend({}, defaultParameters.legend, options.legend);
    this.opts.toolTip = $.extend({}, defaultParameters.toolTip, options.toolTip);
    this.opts.xAxis = $.extend({}, defaultParameters.xAxis, options.xAxis);
    this.opts.yAxis = options.yAxis;
    this.opts.series = options.series;
    this.opts.grid.top = this.opts.grid.top * ViewSize;
    this.opts.grid.right = this.opts.grid.right * ViewSize;
    this.opts.grid.bottom = this.opts.grid.bottom * ViewSize;
    this.opts.grid.left = this.opts.grid.left * ViewSize;
    this.$el = $el;
    this.c = $el[0];
    this.cxt = this.c.getContext('2d');
    initChart.call(this);
    initEvent.call(this);
  };

  /* 插件 */
  function Plugin(options) {
    return new Chart($(this), options);
  };

  /* 绑定 */
  $.fn.chart = Plugin;

}(jQuery));
