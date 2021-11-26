// 钉钉自动内勤打卡-wifi范围内

auto.waitFor();

let NowTime = new Date(); //当前时间不戳

//读取配置
let config = {
  "workTitle": "工作台",
  "stopDingtalk": "强行停止", // 关闭钉钉后台运行、不同手机不一样的按钮、强行停止、结束运行、关闭
  "randomMin": 0, // 随机最小数
  "randomMax": 10, // 随机最大数
};

let keepScreenOnMinutes = 5; // 保存常亮时间
let sleepTime = 5 * 1000; // 暂停的时间
let sleepTime_ding = 10 * 1000; // 钉钉暂停的时间、手机比较卡的，可以延长这个时间
// 上下班时间设定,可以设定提前打或者延迟打，弹性
let sbTime = 9 * 3600 + 0 * 60 + 0; // 9:00:00 上班
let xbTime = 18 * 3600 + 0 * 60 + 0; // 18:00:00 下班
let thisTime = NowTime.getHours() * 3600 + NowTime.getMinutes() * 60 + NowTime.getSeconds(); // 当前时间

let $$init = {
  start() {
    // 判断是否是放假
    isHoliday();
    // 随机延迟
    randomSleep();

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
        console.log('已经全部处理完毕,回到桌面');
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
      // 点击打卡
      clickDaka();
    }

    // 判断是否是放假
    function isHoliday() {
      let nowday = NowTime.getDay(); // 0-周日，6-周六
      if (nowday == 0 || nowday == 6) {
        exit(); // 周末直接停止脚本
      }
      // 节假日需要用接口
    }

    // 随机延迟
    function randomSleep() {
      let randNum = random(config.randomMin, config.randomMax);
      toastLog("随机延迟" + randNum + "分钟");
      sleep(randNum * 60 * 100); // 随机睡觉的数字,分钟为单位
    }

    // 关闭钉钉（这个关闭操作根据自己设备具体情况配置）
    function closeDingtalk() {
      sleep(sleepTime);
      toastLog("关闭钉钉APP ing");
      let packageName = app.getPackageName("钉钉");
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
      toastLog("启动钉钉APP ing");
      let res = app.launchApp("钉钉");
      if (!res) return postMessage("没有找到可以打开的钉钉");
    }

    //进入考勤页面
    function inKaoqin() {
      sleep(sleepTime_ding); // 有时候进入钉钉比较慢
      workBtn = text('工作台').findOne(10000); // 找到工作台
      workBtn.parent().parent().click(); // 点击工作台
      sleep(sleepTime_ding);
      toastLog("进入工作台");
      dkBtn = text("考勤打卡").findOne(10000); // 找到考勤打卡
      dkBtn.click(); // 点击考勤打卡
    }

    //点击打卡
    function clickDaka() {
      sleep(sleepTime_ding);
      if (sbTime > thisTime) { // 上班前打卡
        text1 = "上班打卡";
      } else if (xbTime < thisTime) { // 下班后打卡
        text1 = "下班打卡";
      }
      toastLog("进入打卡页, 当前是"+text1);
      dcard = text(text1).findOne(10000); // 找到外勤打卡
      dcard.click(); // 点击外勤打卡
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
