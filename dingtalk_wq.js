// 钉钉自动外勤打卡-定位打卡

auto.waitFor();

let NowTime = new Date(); //当前时间不戳

//读取配置
let config = {
  "workTitle": "工作台",
  "stopDingtalk": "强行停止", // 关闭钉钉后台运行、不同手机不一样的按钮、强行停止、结束运行、关闭
  "randomMin": 0, // 随机最小数
  "randomMax": 5, // 随机最大数
  "apiUrl": "http://apis.juhe.cn/fapig/calendar/day.php",
  "apiKey": "",
};

let keepScreenOnMinutes = 15; // 保存常亮时间
let sleepTime = 5 * 1000; // 暂停的时间
let sleepTime_ding = 10 * 1000; // 钉钉暂停的时间

let $$init = {
  start() {
    // 判断是否是放假
    isHoliday();

    return wakeUp();

    // 唤醒机器
    function wakeUp() {
      while (!device.isScreenOn()) {
        toastLog("正在唤醒屏幕");
        device.wakeUpIfNeeded(); // 唤醒设备
        device.keepScreenOn(keepScreenOnMinutes * 60 * 1000); // 脚本执行时保持屏幕常亮15分钟
        sleep(sleepTime);
        // 上滑解锁
        // swipe(device.width / 2, 1300, device.width / 2, 300, 1000);
        swipe(device.width / 2, device.height - 500, device.width / 2, 0, random(16, 18) * 50);
        sleep(sleepTime);
        home(); // 回到桌面
      }
      //注册退出事件
      events.on("exit", function () {
        toastLog('已经全部处理完毕,回到桌面');
        device.keepScreenOn(5000); // 脚本执行结束,常亮5秒钟、5秒后按系统自动设定来自己锁屏
        home(); // 回到桌面
      });

      fullChain(); // 开始执行链
    }

    // 流程操作链
    function fullChain() {
      // 先关闭钉钉
      closeDingtalk();
      // 打开钉钉
      openDingtalk();
      // 进入考勤
      inKaoqin();
      // 进入打卡页
      inDaka();
      // 确认定位打卡
      confirmDaka();
    }

    // 判断是否是放假
    function isHoliday() {
      // let nowday = NowTime.getDay(); // 0-周日，6-周六
      // if (nowday == 0 || nowday == 6) {
      //   exit(); // 周末直接停止脚本
      // }
      let year = NowTime.getFullYear();
      let month = NowTime.getMonth() + 1;
      let day = NowTime.getDate();
      day = day > 9 ? day : '0' + day;
      let dater = year + "-" + month + "-" + day;
      let url = config.apiUrl + "?date=" + dater + "&key=" + config.apiKey;
      let res = http.get(url);
      // let data = res.body.json();
      // console.log(data);
      let statusDesc = res.body.json()['result']['statusDesc'];
      if (statusDesc != '工作日') {
        toastLog('非工作日，停止脚本');
        engines.myEngine().forceStop(); // 非工作日直接停止脚本
      }
    }

    // 获取随机睡觉的时间
    function getRangSleep() {
      // 进入钉钉就随机延迟
      let randNum = random(config.randomMin, config.randomMax);
      toastLog("随机延迟" + randNum + "分钟");
      return randNum * 60 * 1000;
    }

    // 关闭钉钉（这个关闭操作根据自己设备具体情况配置）
    function closeDingtalk() {
      sleep(sleepTime);
      toastLog("先关闭钉钉APP ing");
      let packageName = app.getPackageName("钉钉");
      if (!packageName) return postMessage("没有找到可以打开的钉钉");
      app.openAppSetting(packageName);
      text("钉钉").waitFor();
      sleep(sleepTime);
      click(config.stopDingtalk);
      sleep(sleepTime);
      click("确定");
      sleep(sleepTime);
      home(); // 回到桌面
    }

    // 打开钉钉
    function openDingtalk() {
      sleep(sleepTime);
      toastLog("在启动钉钉APP ing");
      let res = app.launchApp("钉钉");
      if (!res) return postMessage("没有找到可以打开的钉钉");
    }

    //进入考勤页面
    function inKaoqin() {
      let rangSleepTime = getRangSleep();
      if (rangSleepTime < sleepTime_ding) rangSleepTime = sleepTime + sleepTime_ding; // 防止出现0的情况
      sleep(rangSleepTime);
      workBtn = text('工作台').findOne(10000); // 找到工作台
      workBtn.parent().parent().click(); // 点击工作台
      sleep(sleepTime_ding);
      toastLog("进入工作台");
      dkBtn = text("考勤打卡").findOne(10000); // 找到考勤打卡
      dkBtn.click(); // 点击考勤打卡
    }

    //点击打卡
    function inDaka() {
      sleep(sleepTime_ding);
      toastLog("进入打卡页");
      let text1 = "外勤打卡";
      dcard = text(text1).findOne(10000); // 找到外勤打卡
      dcard.click(); // 点击外勤打卡
    }

    // 确认定位打卡
    function confirmDaka() {
      sleep(sleepTime_ding);
      let scope, x, y;
      let text1 = "0/1000";
      scope = text(text1).findOne().bounds(); // 找到0/1000的位置,方便计算出打卡的按钮位置
      x = scope.centerX();
      y = scope.centerY();
      // console.log(text1, x, y);
      // console.log(device.width, device.height);
      // X轴直接取中间,Y轴需要计算,在0/1000的下方100
      x = device.width * 0.5;
      y = y + 100;
      console.log('打卡坐标：', x, y);
      click(x, y);
      sleep(sleepTime_ding);
      postMessage('打卡成功');
    }

    function postMessage(message) {
      toastLog(message);
      // 发送到微信通知
      exit();
    }
  },

  bind() {
    return this;
  },
}.bind();

$$init.start();
