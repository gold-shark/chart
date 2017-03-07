(function($, undefined) {
  var data = {
    global: { //全局
      font: 10,
      color: 'black',
      event: 'click'
    },
    grid: { //网格
      top: 20,
      right: 40,
      bottom: 50,
      left: 40
    },
    scale: { //刻度
      show: true,
      space: 5,
      length: 5,
      x: {},
      y: {}
    },
    auxiliaryLine: { //辅助线
      show: true,
      style: 'dashed',
      color: 'silver'
    },
    legend: { //图例
      show: true,
      position: 'bottom'
    },
    toolTip: { //提示
      show: true,
      color: 'white',
      lineColor: 'silver',
      bgColor: 'rgba(0,0,0,.5)'
    },
    xAxis: {
      show: true,
      data: []
    },
    yAxis: [],
    series: []
  };
  /* 获取数组中的最大值  */
  function getArrayMaxValue(array) {
    var maxVal = Number.MIN_VALUE;
    for(var i = 0; i < array.length; i++) {
      if(array[i] > maxVal) {
        maxVal = array[i];
      }
    }
    return maxVal;
  };
  /* 获取数组中的最小值  */
  function getArrayMinValue(array) {
    var minVal = Number.MAX_VALUE;
    for(var i = 0; i < array.length; i++) {
      if(array[i] < minVal) {
        minVal = array[i];
      }
    }
    return minVal;
  };
  /* 获得最小刻度值 */
  function getMinScale(unitSize, minVal, i) {
    var i = i || 0;
    if(i * unitSize >= minVal) {
      return(i - 1) * unitSize;
    } else {
      i++;
      return getMinScale(unitSize, minVal, i);
    }
  };
  /* 获得每一个刻度值大小 */
  function getScaleSize(unitSize, scaleNumber, minScale, maxVal, i) {
    var i = i || 0;
    if(i * unitSize * scaleNumber + minScale > maxVal) {
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
    for(var i = 0; i < width; i += 6) {
      cxt.fillRect(x + i, y, 3, 1);
    }
  };
  /* 绘制虚线  */
  function fillDottedLine(cxt, x, y, width) {
    for(var i = 0; i < width; i += 2) {
      cxt.fillRect(x + i, y, 1, 1);
    }
  };
  /* fontSize */
  function getFontSize(size, n) {
    return size * n + 'px Microsoft YaHei, Arial';
  }
  $.extend($.fn, {
    chart: function(options) {
      var ViewSize = 2;
      var opts = {};
      opts.global = $.extend({}, data.global, options.global);
      opts.grid = $.extend({}, data.grid, options.grid);
      opts.scale = $.extend({}, data.scale, options.scale);
      opts.auxiliaryLine = $.extend({}, data.auxiliaryLine, options.auxiliaryLine);
      opts.legend = $.extend({}, data.legend, options.legend);
      opts.toolTip = $.extend({}, data.toolTip, options.toolTip);
      opts.xAxis = $.extend({}, data.xAxis, options.xAxis);
      opts.yAxis = options.yAxis;
      opts.series = options.series;
      opts.grid.top = opts.grid.top * ViewSize;
      opts.grid.right = opts.grid.right * ViewSize;
      opts.grid.bottom = opts.grid.bottom * ViewSize;
      opts.grid.left = opts.grid.left * ViewSize;
      this.each(function() {
        var $this = $(this);
        var c = $this[0];
        var cxt = c.getContext('2d');
        /* 绘制X轴  */
        function drawXAxis() {
          var b = typeof(opts.xAxis.show) === 'undefined' ? true : opts.xAxis.show;
          if(b) {
            var _rect = {
              x: opts.grid.left,
              y: c.height - opts.grid.bottom,
              width: c.width - opts.grid.right - opts.grid.left + 1, //'+1'y右轴的宽度
              height: 1
            };
            cxt.fillStyle = opts.xAxis.color || opts.global.color;
            cxt.fillRect(_rect.x, _rect.y, _rect.width, _rect.height);
          }
        };
        /* 绘制X轴刻度  */
        function drawXAxisScale(data) {
          var b = true;
          if(typeof(opts.scale.x.show) !== 'undefined') {
            b = opts.scale.x.show;
          } else if(typeof(opts.scale.show) !== 'undefined') {
            b = opts.scale.show;
          }
          var scaleLength = (opts.scale.x.length || opts.scale.length || 5) * ViewSize;
          var scaleSpace = (opts.scale.x.space || opts.scale.space || 5) * ViewSize;
          for(var i = 0; i < data.length; i++) {
            if(b) {
              var _rect = {
                x: Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / data.length * (i + 0.5)),
                y: Math.round(c.height - opts.grid.bottom) + 1, //'+1'x轴的高度
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
        function drawYAxis(n) {
          var b = typeof(opts.yAxis[n].show) === 'undefined' ? true : opts.yAxis[n].show;
          if(b) {
            var _rect = {
              x: opts.grid.left,
              y: opts.grid.top,
              width: 1,
              height: c.height - opts.grid.bottom - opts.grid.top
            };
            if(n) {
              _rect.x = c.width - opts.grid.right;
            }
            cxt.fillStyle = opts.yAxis[n].color || opts.global.color;
            cxt.fillRect(_rect.x, _rect.y, _rect.width, _rect.height);
          }
        };
        /* 绘制Y轴刻度  */
        function drawYAxisScale(n, scaleNumber, scaleSize, minScale) {
          var b = true;
          if(typeof(opts.scale.y.show) !== 'undefined') {
            b = opts.scale.x.show;
          } else if(typeof(opts.scale.show) !== 'undefined') {
            b = opts.scale.show;
          }
          var scaleLength = (opts.scale.x.length || opts.scale.length || 5) * ViewSize;
          var scaleSpace = (opts.scale.x.space || opts.scale.space || 5) * ViewSize;
          for(var i = 0; i <= scaleNumber; i++) {
            if(b) {
              var _rect = {
                x: Math.round(opts.grid.left - scaleLength),
                y: Math.round(opts.grid.top + (c.height - opts.grid.bottom - opts.grid.top) / scaleNumber * i),
                width: scaleLength,
                height: 1
              };
              if(n) {
                _rect.x = Math.round(c.width - opts.grid.right) + 1; //'+1'y右轴宽度
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
            cxt.fillStyle = opts.scale.x.textColor || opts.scale.textColor || opts.global.color;
            if(n) {
              cxt.textAlign = 'left';
              _text.x = Math.round(c.width - opts.grid.right + scaleLength + scaleSpace) + 1; //'+1'y右轴宽度
            }
            cxt.fillText(_text.txt, _text.x, _text.y);
          }
        };
        /* 绘制辅助线   */
        function drawAuxiliaryLine(scaleNumber) {
          var b = typeof(opts.auxiliaryLine.show) === 'undefined' ? true : opts.auxiliaryLine.show;
          if(b) {
            for(var i = 0; i <= scaleNumber; i++) {
              var _line = {
                x: opts.grid.left,
                y: Math.round(opts.grid.top + (c.height - opts.grid.bottom - opts.grid.top) / scaleNumber * i),
                width: c.width - opts.grid.right - opts.grid.left
              }
              cxt.fillStyle = opts.auxiliaryLine.color;
              cxt.globalCompositeOperation = 'destination-over';
              switch(opts.auxiliaryLine.style) {
                case 'solid':
                  cxt.fillRect(_line.x, _line.y, _line.width, 1);
                  break;
                case 'dotted':
                  fillDottedLine(cxt, _line.x, _line.y, _line.width);
                  break;
                case 'dashed':
                  fillDashedLine(cxt, _line.x, _line.y, _line.width);
                  break;
                default:
                  fillDashedLine(cxt, _line.x, _line.y, _line.width);
                  break;
              }
            }
          }
        };
        /* 绘制图示  */
        function drawLegend() {
          var b = typeof(opts.legend.show) === 'undefined' ? true : opts.legend.show;
          if(b) {
            var left = c.width * 0.5;
            cxt.font = getFontSize(opts.legend.font || opts.global.font) * ViewSize;
            $.each(opts.series, function(i) {
              left -= (cxt.measureText(opts.series[i].name).width + 20 * ViewSize) * 0.5;
            });
            $.each(opts.series, function(i) {
              var top = c.height - 15 * ViewSize;
              if(opts.legend.position !== 'bottom') {
                top = 5 * ViewSize;
              }
              switch(opts.series[i].type) {
                case 'bar':
                  cxt.fillStyle = opts.series[i].color;
                  drawFillet(cxt, left, top, 18 * ViewSize, 12 * ViewSize, 2);
                  cxt.fill();
                  //cxt.fillRect(left, top, 18 * ViewSize, 12 * ViewSize);
                  left += 22 * ViewSize;
                  break;
                case 'line':
                  cxt.strokeStyle = opts.series[i].color;
                  cxt.fillStyle = 'white';
                  cxt.lineWidth = 1;
                  cxt.beginPath();
                  cxt.moveTo(left, top + 6 * ViewSize);
                  cxt.lineTo(left + 18 * ViewSize, top + 6 * ViewSize);
                  cxt.closePath();
                  cxt.stroke();
                  cxt.beginPath();
                  cxt.arc(left + 9 * ViewSize, top + 6 * ViewSize, 5, 0, 2 * Math.PI);
                  cxt.closePath();
                  cxt.stroke();
                  cxt.fill();
                  left += 22 * ViewSize;
                  break;
                default:
                  cxt.fillStyle = opts.series[i].color;
                  drawFillet(cxt, left, top, 18 * ViewSize, 12 * ViewSize, 2);
                  cxt.fill();
                  //cxt.fillRect(left, top, 18 * ViewSize, 12 * ViewSize);
                  left += 22 * ViewSize;
              }
              cxt.font = getFontSize(opts.legend.font || opts.global.font) * ViewSize;
              cxt.textAlign = 'left';
              cxt.textBaseline = 'hanging';
              cxt.fillStyle = opts.legend.color || opts.global.color;
              cxt.fillText(opts.series[i].name, left, top);
              left += cxt.measureText(opts.series[i].name).width + 7 * ViewSize;
            });
          }
        };
        /* 绘制柱状图  */
        function drawBarChart(series, minScale, maxScale) {
          for(var i = 0; i < series.data.length; i++) {
            var wid = (series.width || 10) * ViewSize;
            var val = (series.data[i] - minScale) * (c.height - opts.grid.bottom - opts.grid.top) / maxScale;
            var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / series.data.length * (i + 0.5) - wid * 0.5);
            var top = Math.round(c.height - opts.grid.bottom - val);
            cxt.globalCompositeOperation = 'source-over';
            cxt.fillStyle = series.color || 'black';
            cxt.fillRect(left, top, wid, val - 1); //"val-1"是为了显示X轴
          }
        };
        /* 绘制折线图 */
        function drawLineChart(series, minScale, maxScale) {
          cxt.globalCompositeOperation = 'source-over';
          cxt.strokeStyle = series.color || 'black';
          cxt.fillStyle = 'white';
          cxt.lineWidth = 1;
          cxt.lineJoin = 'round';
          cxt.beginPath();
          /* 线  */
          for(var i = 0; i < series.data.length; i++) {
            var val = (series.data[i] - minScale) * (c.height - opts.grid.bottom - opts.grid.top) / maxScale;
            var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / series.data.length * (i + 0.5));
            var top = Math.round(c.height - opts.grid.bottom - val);
            if(i === 0) {
              cxt.moveTo(left, top);
            } else {
              cxt.lineTo(left, top);
            }
          }
          cxt.moveTo(0, 0);
          cxt.closePath();
          cxt.stroke();
          for(var i = 0; i < series.data.length; i++) {
            var val = (series.data[i] - minScale) * (c.height - opts.grid.bottom - opts.grid.top) / maxScale;
            var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / series.data.length * (i + 0.5));
            var top = Math.round(c.height - opts.grid.bottom - val);
            cxt.beginPath();
            cxt.arc(left, top, 3, 0, 2 * Math.PI);
            cxt.closePath();
            cxt.fill();
            cxt.stroke();
          }
        };
        /* 绘制提示工具  */
        function drawTooltip(x, y) {
          var b = typeof(opts.toolTip.show) === 'undefined' ? true : opts.toolTip.show;
          if(b) {
            var x = x * ViewSize;
            var y = y * ViewSize;
            for(var i = 0; i < opts.xAxis.data.length; i++) {
              var left = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / opts.xAxis.data.length * i);
              var center = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / opts.xAxis.data.length * (i + 0.5));
              var right = Math.round(opts.grid.left + (c.width - opts.grid.right - opts.grid.left) / opts.xAxis.data.length * (i + 1));
              var top = opts.grid.top;
              var bottom = c.height - opts.grid.bottom;
              if(x > left && x < right && y > top && y < bottom) {
                cxt.fillStyle = opts.toolTip.lineColor;
                cxt.font = getFontSize(opts.toolTip.font || opts.global.font, ViewSize);
                //cxt.fillRect(left, top, right - left, bottom - top);
                cxt.fillRect(center, top, 1, bottom - top);
                var toolLeft = center + 10 * ViewSize;
                var toolTop = Math.round(top + (bottom - top) * 0.5);
                var toolWidth = cxt.measureText(opts.xAxis.data[i]).width + 30 * ViewSize;
                var toolHeight = 25 * ViewSize;
                var toolText = [opts.xAxis.data[i]];
                var toolArc = [];
                for(var j = 0; j < opts.series.length; j++) {
                  var num = cxt.measureText(opts.series[j].name + ' : ').width + cxt.measureText(opts.series[j].data[i]).width + 30 * ViewSize;
                  if(num > toolWidth) {
                    toolWidth = num;
                  }
                  toolText.push(opts.series[j].name + ' : ' + opts.series[j].data[i]);
                  toolArc.push({
                    x: toolLeft + 10 * ViewSize,
                    y: toolTop + toolHeight + 1 * ViewSize,
                    r: 4 * ViewSize,
                    color: opts.series[j].color
                  });
                  toolHeight += 15 * ViewSize;
                }
                if(toolLeft + toolWidth > c.width - opts.grid.right) {
                  toolLeft -= toolWidth + 10 * ViewSize;
                  for(var k in toolArc) {
                    toolArc[k].x = toolLeft + 10 * ViewSize;
                  }
                }
                if(toolTop + toolHeight > c.height - opts.grid.bottom) {
                  toolTop -= toolHeight + 10 * ViewSize;
                  for(var k in toolArc) {
                    toolArc[k].y = toolTop + toolHeight + 1 * ViewSize;
                  }
                }
                cxt.fillStyle = opts.toolTip.bgColor;
                drawFillet(cxt, toolLeft, toolTop, toolWidth, toolHeight, 3);
                cxt.fill();
                cxt.font = getFontSize(opts.toolTip.font || opts.global.font, ViewSize);
                cxt.textAlign = 'left';
                cxt.textBaseline = 'top';
                for(var k in toolText) {
                  var _left = toolLeft + 5 * ViewSize;
                  if(k != 0) {
                    _left = toolLeft + 16 * ViewSize;
                  }
                  cxt.fillStyle = opts.toolTip.color;
                  cxt.fillText(toolText[k], _left, toolTop + k * 15 * ViewSize + 5 * ViewSize);
                }
                for(var k in toolArc) {
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
          /* 清除画布  */
          cxt.clearRect(0, 0, c.width, c.height);
          if(opts.xAxis.data.length) {
            drawXAxis();
            drawXAxisScale(opts.xAxis.data);
          }
          if(opts.yAxis.length && opts.series.length) {
            drawLegend();
            $.each(opts.series, function(i) {
              var scaleNumber = 5;
              var unitSize = 10;
              var zeroScale = typeof(opts.yAxis[i].zeroScale) === 'undefined' ? true : opts.yAxis[i].zeroScale;
              if(opts.yAxis[i].scaleNumber) {
                scaleNumber = opts.yAxis[i].scaleNumber;
              }
              if(opts.yAxis[i].unitSize) {
                unitSize = opts.yAxis[i].unitSize;
              }
              var maxVal = getArrayMaxValue(opts.series[i].data);
              var minVal = getArrayMinValue(opts.series[i].data);
              var minScale = zeroScale ? 0 : getMinScale(unitSize, minVal);
              var scaleSize = getScaleSize(unitSize, scaleNumber, minScale, maxVal);
              var maxScale = scaleNumber * scaleSize;
              drawYAxis(i);
              drawYAxisScale(i, scaleNumber, scaleSize, minScale);
              drawAuxiliaryLine(scaleNumber);
              switch(opts.series[i].type) {
                case 'bar':
                  drawBarChart(this, minScale, maxScale);
                  break;
                case 'line':
                  drawLineChart(this, minScale, maxScale);
                  break;
                default:
                  drawBarChart(this, minScale, maxScale);
                  break;
              }

            });
          }
        };
        initChart();
        $this.on(opts.global.event, function(e) {
          var x = e.pageX - $(this).offset().left;
          var y = e.pageY - $(this).offset().top;
          initChart();
          drawTooltip(x, y);
        });
      });
    }
  });
}(jQuery));