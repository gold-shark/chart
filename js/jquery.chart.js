(function($, undefined) {
  var data = {
    grid: {
      top: 10,
      right: 60,
      bottom: 60,
      left: 60
    },
    yAxis: [{
      unitSize: 50
    }, {
      unitSize: 500
    }],
    xAxis: {
      data: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    },
    series: [{
      name: '直接访问量',
      type: 'bar',
      width: 30,
      color: 'gold',
      data: [10, 52, 200, 334, 390, 330, 220]
    }, {
      name: '间接访问量',
      type: 'line',
      color: 'red',
      data: [2000, 3000, 1220, 3100, 1000, 1500, 3500]
    }]
  };
  /* 获取数组中的最大值  */
  function getArrayMaxValue(array) {
    var max = 0;
    for(var i = 0; i < array.length; i++) {
      if(array[i] > max) {
        max = array[i];
      }
    }
    return max;
  };
  /* 获取单元个数 */
  function getScaleNumber(unitSize, max, number) {
    var number = number || 1;
    if(number * unitSize > max) {
      return number;
    } else {
      number++;
      return getScaleNumber(unitSize, max, number);
    }
  };
  $.extend($.fn, {
    chart: function(options) {
      var opts = $.extend({}, options, data);
      this.each(function(i) {
        var $this = $(this);
        var c = $this[0];
        var cxt = c.getContext('2d');
        var scaleLegth = 5;
        var axisInfo = {
          top: opts.grid.top,
          right: c.width - opts.grid.right,
          bottom: c.height - opts.grid.bottom,
          left: opts.grid.left,
          width: c.width - opts.grid.right - opts.grid.left,
          height: c.height - opts.grid.bottom - opts.grid.top
        };
        /* 绘制Y轴信息  */
        function drawYAxis(direction, scaleNumber, unitSize) {
          cxt.fillStyle = 'black';
          cxt.font = '14px Microsoft YaHei, Arial';
          cxt.textBaseline = 'middle';
          if(direction) {
            cxt.textAlign = 'left';
            /* Y右轴 */
            cxt.fillRect(axisInfo.right, axisInfo.top, 1, axisInfo.height);
          } else {
            cxt.textAlign = 'right';
            /* Y左轴 */
            cxt.fillRect(axisInfo.left, axisInfo.top, 1, axisInfo.height);
          }
          /* Y轴刻度 */
          for(var i = 0; i <= scaleNumber; i++) {
            var left;
            var txtLeft;
            if(direction) {
              left = axisInfo.right;
              txtLeft = axisInfo.right + scaleLegth;

            } else {
              left = axisInfo.left - scaleLegth;
              txtLeft = axisInfo.left - scaleLegth;
            }
            var top = Math.round(axisInfo.top + axisInfo.height / scaleNumber * i);
            var txt = (scaleNumber - i) * unitSize;
            var width = axisInfo.width;
            cxt.fillStyle = 'black';
            cxt.fillRect(left, top, scaleLegth, 1);
            cxt.fillText(txt, txtLeft, top);
            if(i !== scaleNumber) {
              /* Y轴参考线 */
              cxt.fillStyle = 'silver';
              cxt.globalCompositeOperation = 'destination-over';
              for(var j = 0; j < width; j += 5) {
                if(j % 2 === 0) {
                  cxt.fillRect(axisInfo.left + j, top, 5, 1);
                }
              }
            }
          }
        };
        /* 绘制X轴信息  */
        function drawXAxis() {
          cxt.fillStyle = 'black';
          cxt.font = '14px Microsoft YaHei, Arial';
          cxt.textAlign = 'center';
          cxt.textBaseline = 'top';
          /* X轴 */
          cxt.fillRect(axisInfo.left, axisInfo.bottom, axisInfo.width, 1);
          /* X轴刻度  */
          for(var i = 0; i < opts.xAxis.data.length; i++) {
            var left = Math.round(axisInfo.left + axisInfo.width / opts.xAxis.data.length * (i + 0.5));
            var top = Math.round(axisInfo.bottom);
            var txt = opts.xAxis.data[i];
            cxt.fillRect(left, top, 1, scaleLegth);
            cxt.fillText(txt, left, top + scaleLegth);
          }
        };
        /* 绘制柱状图  */
        function drawBarChart(series, scaleMaxValue) {
          cxt.globalCompositeOperation = 'source-over';
          cxt.fillStyle = series.color;
          for(var i = 0; i < series.data.length; i++) {
            var val = series.data[i] * axisInfo.height / scaleMaxValue;
            var left = Math.round(axisInfo.left + axisInfo.width / series.data.length * (i + 0.5) - series.width * 0.5);
            var top = Math.round(axisInfo.bottom - val);
            cxt.fillRect(left, top, series.width, val);
          }
        };
        /* 绘制折线图 */
        function drawLineChart(series, scaleMaxValue) {
          cxt.globalCompositeOperation = 'source-over';
          cxt.strokeStyle = series.color;
          cxt.lineWidth = 2;
          cxt.lineJoin = 'round';
          cxt.beginPath();
          /* 线  */
          for(var i = 0; i < series.data.length; i++) {
            var val = series.data[i] * axisInfo.height / scaleMaxValue;
            var left = Math.round(axisInfo.left + axisInfo.width / series.data.length * (i + 0.5));
            var top = Math.round(axisInfo.bottom - val);
            if(i === 0) {
              cxt.moveTo(left, top);
            } else {
              cxt.lineTo(left, top);
            }
          }
          cxt.moveTo(0, 0);
          cxt.closePath();
          cxt.stroke();
          /* 点   */
          cxt.fillStyle = 'white';
          cxt.lineWidth = 1;
          for(var i = 0; i < series.data.length; i++) {
            var val = series.data[i] * axisInfo.height / scaleMaxValue;
            var left = Math.round(axisInfo.left + axisInfo.width / series.data.length * (i + 0.5));
            var top = Math.round(axisInfo.bottom - val);
            cxt.beginPath();
            cxt.arc(left, top, 2, 0, 2 * Math.PI);
            cxt.closePath();
            cxt.fill();
            cxt.stroke();
          }
        };
        /* 绘制圆角矩形  */
        function drawFillet(x, y, width, height, radius) {
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
        /* 绘制示例  */
        function drawLegend() {
          var left = c.width * 0.5;
          $.each(opts.series, function(i) {
            left -= (opts.series[i].name.length * 14 + 40) * 0.5;
          });
          $.each(opts.series, function(i) {
            switch(opts.series[i].type) {
              case 'bar':
                cxt.fillStyle = opts.series[i].color;
                drawFillet(left, c.height - 20, 26, 16, 3);
                cxt.fill();
                //cxt.fillRect(left, c.height - 20, 26, 16);
                left += 30;
                break;
              case 'line':
                cxt.strokeStyle = opts.series[i].color;
                cxt.fillStyle = 'white';
                cxt.lineWidth = 2;
                cxt.beginPath();
                cxt.moveTo(left, c.height - 12);
                cxt.lineTo(left + 26, c.height - 12);
                cxt.closePath();
                cxt.stroke();
                cxt.beginPath();
                cxt.arc(left + 13, c.height - 12, 5, 0, 2 * Math.PI);
                cxt.closePath();
                cxt.stroke();
                cxt.fill();
                left += 30;
                break;
              default:
                cxt.fillStyle = opts.series[i].color;
                drawFillet(left, c.height - 20, 26, 16, 3);
                cxt.fill();
                //cxt.fillRect(left, c.height - 20, 26, 16);
                left += 30;
                break;
            }
            cxt.font = '14px Microsoft YaHei, Arial';
            cxt.fillStyle = 'black';
            cxt.textAlign = 'left';
            cxt.textBaseline = 'top';
            cxt.fillText(opts.series[i].name, left, c.height - 22);
            left += opts.series[i].name.length * 14 + 10;
          });
        };
        /* 绘制提示工具  */
        function drawTooltip(x, y) {
          for(var i = 0; i < opts.xAxis.data.length; i++) {
            var left = Math.round(axisInfo.left + axisInfo.width / opts.xAxis.data.length * i);
            var center = Math.round(axisInfo.left + axisInfo.width / opts.xAxis.data.length * (i + 0.5));
            var right = Math.round(axisInfo.left + axisInfo.width / opts.xAxis.data.length * (i + 1));
            var top = axisInfo.top;
            var bottom = axisInfo.bottom;
            if(x > left && x < right && y > top && y < bottom) {
              cxt.fillStyle = '#00cc00';
              //cxt.fillRect(left, top, right - left, bottom - top);
              cxt.fillRect(center, top, 1, bottom - top);
              var toolLeft = center + 10;
              var toolTop = Math.round(top + (bottom - top) * 0.5);
              var toolWidth = opts.xAxis.data[i].length * 14 + 10;
              var toolHeight = 30;
              var toolText = [opts.xAxis.data[i]];
              for(var j = 0; j < opts.series.length; j++) {
                var num = opts.series[j].name.length * 14 + opts.series[j].data[i].toString().length * 14;
                if(num > toolWidth) {
                  toolWidth = num;
                }
                toolHeight += 20;
                toolText.push(opts.series[j].name + ' : ' + opts.series[j].data[i]);
              }
              if(toolLeft + toolWidth > axisInfo.right) {
                toolLeft -= toolWidth;
              }
              if(toolTop + toolHeight > axisInfo.bottom) {
                toolTop -= toolHeight;
              }
              cxt.fillStyle = 'rgba(0,0,0,0.7)';
              drawFillet(toolLeft, toolTop, toolWidth, toolHeight, 3);
              cxt.fill();
              cxt.font = '14px Microsoft YaHei, Arial';
              cxt.fillStyle = 'white';
              cxt.textAlign = 'left';
              cxt.textBaseline = 'top';
              for(var k in toolText) {
                cxt.fillText(toolText[k], toolLeft + 5, toolTop + 5 + k * 20);
              }
            }
          }
        };
        /* 绘制图表  */
        function initChart() {
          /* 清除画布  */
          cxt.clearRect(0, 0, c.width, c.height);
          drawLegend();
          drawXAxis();
          $.each(opts.series, function(i) {
            var max = getArrayMaxValue(opts.series[i].data);
            var scaleNumber = getScaleNumber(opts.yAxis[i].unitSize, max);
            var scaleMaxValue = scaleNumber * opts.yAxis[i].unitSize;
            drawYAxis(i, scaleNumber, opts.yAxis[i].unitSize);
            switch(opts.series[i].type) {
              case 'bar':
                drawBarChart(opts.series[i], scaleMaxValue);
                break;
              case 'line':
                drawLineChart(opts.series[i], scaleMaxValue);
                break;
              default:
                drawBarChart(opts.series[i], scaleMaxValue);
                break;
            }
          });
        };
        initChart();
        $this.on('click', function(e) {
          var x = e.pageX - $(this).offset().left;
          var y = e.pageY - $(this).offset().top;
          initChart();
          drawTooltip(x, y);
        });
      });
    }
  });
}(jQuery));