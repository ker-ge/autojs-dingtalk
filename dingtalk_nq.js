// 钉钉自动内勤打卡-wifi范围内

auto.waitFor();

let NowTime = new Date(); //当前时间不戳

//读取配置
let config = {
  "appName": "钉钉",
  "stopAppBtn": "强行停止", // 关闭后台运行按钮、不同手机不一样的按钮、强行停止、结束运行、关闭
  "stopAppConfirmBtn": "确定", // 确认关闭后台运行按钮
  "workTitle": "工作台",
  "kaoQinTitle": "考勤打卡",
  "randomMin": 0, // 随机最小数
  "randomMax": 5, // 随机最大数
  "apiUrl": "http://apis.juhe.cn/fapig/calendar/day.php",
  "apiKey": "",
};

let keepScreenOnMinutes = 5; // 保存常亮时间
let sleepTime = 5 * 1000; // 暂停的时间
let sleepTime_app = 10 * 1000; // 软件暂停的时间、手机比较卡的，可以延长这个时间
// 上下班时间设定,可以设定提前打或者延迟打，弹性
let sbTime = 9 * 3600 + 0 * 60 + 0; // 9:00:00 上班
let xbTime = 18 * 3600 + 0 * 60 + 0; // 18:00:00 下班
let thisTime = NowTime.getHours() * 3600 + NowTime.getMinutes() * 60 + NowTime.getSeconds(); // 当前时间

let $$init = {
  start() {
    // 判断是否是放假
    // isHoliday();

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
      // 先关闭
      closeApp();
      // 再打开
      openApp();
      // 进入考勤
      inKaoqin();
      // 点击打卡
      clickDaka();
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

    // 随机延迟
    function randomSleep() {
      let randNum = random(config.randomMin, config.randomMax);
      toastLog("随机延迟" + randNum + "分钟");
      sleep(randNum * 60 * 1000); // 随机睡觉的数字,分钟为单位
    }

    // 关闭软件（这个关闭操作根据自己设备具体情况配置）
    function closeApp() {
      sleep(sleepTime);
      toastLog("先关闭" + config.appName + "APP ing");
      let packageName = app.getPackageName(config.appName);
      if (!packageName) return postMessage("没有找到可以打开的" + config.appName);
      app.openAppSetting(packageName);
      text(config.appName).waitFor();
      sleep(sleepTime);
      click(config.stopAppBtn);
      sleep(sleepTime);
      click(config.stopAppConfirmBtn);
      sleep(sleepTime);
      home(); // 回到桌面
    }

    // 打开软件
    function openApp() {
      sleep(sleepTime);
      toastLog("在启动" + config.appName + "APP ing");
      let res = app.launchApp(config.appName);
      if (!res) return postMessage("没有找到可以打开的" + config.appName);
      randomSleep(); // 随机睡觉
    }

    //进入考勤页面
    function inKaoqin() {
      sleep(sleepTime_app); // 有时候进入比较慢
      clickMessage(config.workTitle);
      toastLog("点击" + config.workTitle);
      sleep(sleepTime_app); // 有时候进入比较慢
      clickMessage(config.kaoQinTitle);
      toastLog("点击" + config.kaoQinTitle);
      sleep(sleepTime_app); // 有时候进入比较慢
    }

    //点击打卡
    function clickDaka() {
      sleep(sleepTime_app); // 有时候进入比较慢
      if (sbTime > thisTime) { // 上班前打卡
        text1 = "上班打卡";
      } else if (xbTime < thisTime) { // 下班后打卡
        text1 = "下班打卡";
      }
      toastLog("进入打卡页, 当前是" + text1);
      clickMessage(text1);
      sleep(sleepTime_app); // 有时候进入比较慢
      postMessage('打卡成功');
    }

    //根据控件文字点击，如果点击失败，则说明打卡流程无法正常进行，结束脚本运行
    function clickMessage(message) {
      var n = 3;
      var logo = false;
      while (n--) {
        if (click(message)) {
          logo = true;
          break;
        }
        sleep(sleepTime);
      }
      if (logo == false) {
        console.error("点击" + message + "出错");
        exit();
      }
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
