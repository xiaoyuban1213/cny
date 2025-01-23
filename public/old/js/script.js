var monthname = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
	function padding(topad)
{
    topad = topad.toString();
    if (topad.length == 1)
    {
    topad = '0' + topad;
    };
    return topad;
};
function tempus()
{
    now = new Date();
    document.getElementById("time").innerHTML = padding(now.getHours()) + ':' + padding(now.getMinutes()) + ':' + padding(now.getSeconds());
    document.getElementById("date").innerHTML = now.getFullYear() + '年' + monthname[now.getMonth()] + '月' + now.getDate()+ '日';
    setTimeout("tempus()", 1000);
};
$(function()
{

	//active snow
	if($.isFunction($.fn.snowy))
	{
		$('.snowy').each(function()
		{
			//check for data
			if($(this).is('[data-snowy]'))
			{
				$(this).snowy($(this).data('snowy'));
			}
			else
			{
				$(this).snowy();
			}
		});
	}
	
	//countdown
	if($.isFunction($.fn.countdown))
	{
		$('.countdown[data-date]').countdown(
		{
			date: $(this).data('date'),
			render: function(data)
			{
				$(this.el).html
				(
					"<div class=\"countdown-box\"><H4 class=\"countdown-number\">" + data.days + "</H4>" + " <h4 class=\"countdown-title\">天</h4></div>" +
					"<div class=\"countdown-box\"><H4 class=\"countdown-number\">" + data.hours + "</H4>" + " <h4 class=\"countdown-title\">时</h4></div>" +
					"<div class=\"countdown-box\"><H4 class=\"countdown-number\">" + this.leadingZeros(data.min, 2) + "</H4>" + " <h4 class=\"countdown-title\">分</h4></div>" +
					"<div class=\"countdown-box\"><H4 class=\"countdown-number\">" + this.leadingZeros(data.sec, 2) + "</H4>" + " <h4 class=\"countdown-title\">秒</h4></div>"
				);
			}
		});
	}
	
	//fullpage
	if($.isFunction($.fn.fullpage))
	{
		$('.fullpage').fullpage(
		{
			navigation: true,
			verticalCentered: true,
			afterRender: function()
			{
				//get container
				var container = $(this);
				//find section count
				var count = container.find('.section').length;
				//create previous slide button
				var prev = $('<a href="#" class="fp-prev"><i class="fa fa-arrow-up" aria-hidden="true"></i></a>');
				//create next slide button
				var next = $('<a href="#" class="fp-next"><i class="fa fa-arrow-down" aria-hidden="true"></i></a>');
				//add previous slide button action
				prev.on('click', function(e)
				{
					e.preventDefault();
					$.fn.fullpage.moveSectionUp();
				});
				//add next slide button action
				next.on('click', function(e)
				{
					e.preventDefault();
					$.fn.fullpage.moveSectionDown();
				});
				//add buttons to body
				$('body').append(prev);
				$('body').append(next);
				//set prev as unvisible
				prev.addClass('unvisible');
				//check for slides
				if(count <= 1)
				{
					//set next as unvisible
					next.addClass('unvisible');
				}
				//set prev data section
				prev.attr('data-section', 1);
				//set next data section
				next.attr('data-section', Math.min(count, 2));
			},
			afterLoad: function(anchorLink, index)
			{
				//get section
				var section = $(this);
				//find section count
				var count = section.parent().find('.section').length;
				
				//check for first section
				if(index == 1)
				{
					//hide prev slide
					$('.fp-prev').removeClass('visible').addClass('unvisible');
				}
				else
				{
					//show prev slide
					$('.fp-prev').removeClass('unvisible').addClass('visible');
				}
				
				//check for last section
				if(index == count)
				{
					//hide next slide
					$('.fp-next').removeClass('visible').addClass('unvisible');
				}
				else
				{
					//show next slide
					$('.fp-next').removeClass('unvisible').addClass('visible');
				}
				
				//set data section tags
				$('.fp-prev').attr('data-section', Math.max(1, index - 1));
				$('.fp-next').attr('data-section', Math.min(count, index + 1));
			}
		});
	}
	
	//audio player
	$('.audio-player').each(function()
	{
		//get audio element
		var audio = $(this);
		//create container
		var container = $('<div class="audio-player-container"></div>');
		//create div element
		var player = $('<div class="audio-player"></div>');
		//create bars
		var bars = $
		(
			'<div class="audio-bars">' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
			'</div>'
		);
		
		//remove audio player class from audio tag
		audio.removeClass('audio-player');
		
		//insert player in container
		container.append(player);
		//insert container element
		container.insertAfter(audio);
		
		//add audio bars
		player.append(bars);
		
		//on audio play
		audio[0].onplay = function()
		{
			player.addClass('on').removeClass('off');
		};
		
		//on audio pause
		audio[0].onpause = function()
		{
			player.addClass('off').removeClass('on');
		};
		
		//on audio player click
		bars.on('click', function()
		{
			if (audio[0].paused == false)
			{
				audio[0].pause();
			}
			else
			{
				audio[0].play();
			}
		});
		
		//set player status
		if(audio[0].paused == false)
		{
			player.addClass('on').removeClass('off');
		}
		else
		{
			player.addClass('off').removeClass('on');
		}
	});
	
	//ajax forms
	$('.ajax-form').on('submit', function(e)
	{
		//get current form
		var $form = $(this);
		//get method
		var method = $form.attr('method').toUpperCase();
		//get action
		var action = $form.attr('action');
		//send ajax request
		$.ajax(
		{
			type: method,
			url: action,
			data: $form.serialize(),
			success: function(data)
			{
				if(data.indexOf('alert-success') > 0)
				{
					$form.trigger('reset');
				}
			
				if($form.is('[data-result]'))
				{
					$($form.data('result')).html(data);
				}
			}
		});
		
		e.preventDefault();
	});
	
	//snow text
	$(window).on('resize', function()
	{
		$('.snow-text').each(function()
		{
			//get element
			var $this = $(this);
			//get text
			var text = $this.text();
			//get chars count
			var chars = text.length;
			//check for portrait/landscape mode
			if($(window).width() > $(window).height())
			{
				//calculate font size
				var font_size = Math.min(16, 200 / chars);
				//set font size
				$this.css('font-size', font_size + 'vh');
			}
			else
			{
				//calculate font size
				var font_size = Math.min(15, 160 / chars);
				//set font size
				$this.css('font-size', font_size + 'vw');
			}
		});
		
	}).trigger('resize');
	
});

//  musicLyric 是预先定义好的LRC格式歌词字符串
var musicLyric = "[00:00.000]触摸天空（BDF2019）\n[00:00.44]（合）跟着我 像双手触摸天空般跳起来\n[00:05.31]穿过夜空 徜徉星海\n[00:08.49]跟着我 为走过的路跳起来\n[00:12.29]驱散所有的阴霾\n[00:44.48]（漆柚）想把青空云海 摘下来\n[00:48.20]包装成一盒意外 用心装载\n[00:52.52]然后在 多年后拆开来\n[00:55.52]绽放出最绚烂的色彩\n[00:59.30]（凑诗）想把一路精彩 留下来\n[01:03.17]凝聚成一段节拍 用梦填满\n[01:07.56]然后在 这一刻唱出来\n[01:10.38]幸好聚光灯下你还在\n[01:14.29]（合）跟着我 像双手触摸天空般跳起来\n[01:18.87]穿过夜空 徜徉星海\n[01:22.23]跟着我 为走过的路跳起来\n[01:26.32]驱散所有的阴霾\n[01:29.64]跟着我 为付出的爱跳起来\n[01:33.74]别让期待中的乐章苍白\n[01:37.09]跟着我 为做过的梦跳起来\n[01:41.09]这里有我 期待的未来\n[01:44.78]（合）热爱无可取代\n[01:48.32]坚持无须摇摆\n[01:52.18]梦想无限澎湃\n[01:55.77]（合）这里是我最喜欢的舞台\n[02:13.05]（易言）把这一秒风采 停下来\n[02:16.73]提醒我过去曾在 未来会来\n[02:21.17]多慷慨 就会有多感慨\n[02:23.98]留在这青春无悔年代\n[02:27.85]（锦鲤姬）想把人影灯海 拍下来\n[02:31.36]留住这煌煌时代 一束光彩\n[02:35.90]多年后 期待你依然在\n[02:38.80]这一座星光熠熠的舞台\n[02:42.85]（合）跟着我 像双手触摸天空般跳起来\n[02:47.45]就当一切无法重来\n[02:50.63]跟着我 为走过的路跳起来\n[02:54.64]还有太多的期待\n[02:58.05]跟着我 为付出的爱跳起来\n[03:02.31]尽情付出不要害怕苍白\n[03:05.45]跟着我 为做过的梦跳起来\n[03:09.45]这里是我 最喜欢的舞台\n[03:13.45]（合）热爱无可取代\n[03:16.88]坚持无须摇摆\n[03:20.74]梦想无限澎湃\n[03:24.25]（合）这里有我期待的未来";


// 将LRC歌词字符串转换为时间戳和文本的数组
function parseLyrics(lyricsText) {
  return lyricsText.split('\n').map(function (line) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (!match) return null;
    const mm = parseInt(match[1], 10);
    const ss = parseInt(match[2], 10);
    const ms = parseInt(match[3], 10); // 毫秒部分已经是整数，无需额外处理
    const timestamp = mm * 60 * 1000 + ss * 1000 + ms;
    return {
      timestamp: timestamp,
      text: match[4].trim()
    };
  }).filter(Boolean); // 过滤掉null值
}

var musicLyricContent = parseLyrics(musicLyric);
var musicPlayer = document.getElementById('audio');
var musicLyricDisplay = document.getElementById('subtitle');
var currentLineIndex = 0;

// 更新歌词显示的函数
function updateLyricDisplay() {
currentLineIndex = 0;
  const currentTime = Math.floor(musicPlayer.currentTime * 1000); // 取整到最近的毫秒

  // 检查是否需要更新歌词行
  while (currentLineIndex < musicLyricContent.length - 1 && 
         musicLyricContent[currentLineIndex + 1].timestamp <= currentTime) {
    currentLineIndex++;
  }

  // 更新歌词显示
  musicLyricDisplay.textContent = musicLyricContent[currentLineIndex].text;

  // 如果音乐未结束，继续递归更新歌词
  if (!musicPlayer.ended) {
    requestAnimationFrame(updateLyricDisplay);
  } else {
    // 音乐结束时重置歌词索引，准备下一次播放
    currentLineIndex = 0;
  }
}

// 音乐播放时绑定事件
musicPlayer.addEventListener('play', function() {
  currentLineIndex = 0; // 重置当前歌词行索引
  updateLyricDisplay(); // 开始更新歌词
});

// 音乐播放结束时重置歌词
musicPlayer.addEventListener('ended', function() {
  musicPlayer.currentTime = 0; // 重置音乐播放时间
});

// 初始化歌词显示
if (musicLyricContent.length > 0) {
  musicLyricDisplay.textContent = musicLyricContent[0].text;
}
		
// 设置结束时间的时间戳
var endTime = new Date("2025/1/29 00:00:00").getTime();

// 弹窗提示
function showPopup() {
  var overlay = document.createElement('div');
  overlay.className = 'popup-overlay show-popup';
  document.body.appendChild(overlay);

  var popup = document.createElement('div');
  popup.className = 'popup-content';
  popup.innerText = '2025年春节已经到来，5s后将跳转至2026年春节倒计时 \n \n 御坂网络祝你万事如意，心想事成！';
  document.body.appendChild(popup);

  // 5秒后跳转
  setTimeout(function() {
    window.location.href = "https://xiaoyuban1213.github.io/2025/";
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  }, 5000);
} 

// 设置定时器
var timer = setInterval(function() {
  // 获取当前时间的时间戳
  var nowTime = new Date().getTime();
  // 计算剩余的时间（毫秒）
  var leftTime = endTime - nowTime;
  // 计算剩余的秒数
  var seconds = Math.floor(leftTime / 1000);
  // 判断倒计时是否结束
  if(seconds <= 0) {
    clearInterval(timer);
    showPopup(); // 显示弹窗
  }
}, 1000);