/** 针对极速打卡，打开软件即可
 * 权限记得开
 */

auto.waitFor();

let NowTime = new Date(); //当前时间不戳

//读取配置
let config = {
  "appName": "钉钉",
  "stopAppBtn": "强行停止", // 关闭后台运行按钮、不同手机不一样的按钮、强行停止、结束运行、关闭
  "stopAppConfirmBtn": "确定", // 确认关闭后台运行按钮
  "randomMin": 0, // 随机最小数
  "randomMax": 5, // 随机最大数
};

let keepScreenOnMinutes = 15; // 保存常亮时间
let sleepTime = 5 * 1000; // 暂停的时间
let sleepTime_app = 60 * 1000; // 暂停的时间

let $$init = {
  start() {
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
      getRangSleep(); // 先随机睡觉
      // 先关闭
      closeApp();
      // 在打开
      openApp();
    }

    // 关闭软件（这个关闭操作根据自己设备具体情况配置）
    function closeApp() {
      sleep(sleepTime);
      toastLog("先关闭"+config.appName+"APP ing");
      let packageName = app.getPackageName(config.appName);
      if (!packageName) return postMessage("没有找到可以打开的"+config.appName);
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
      toastLog("在启动"+config.appName+"APP ing");
      let res = app.launchApp(config.appName);
      if (!res) return postMessage("没有找到可以打开的"+config.appName);
      sleep(sleepTime_app); // 呆在软件里面的时间
    }

    // 随机睡觉的时间
    function getRangSleep() {
      let randNum = random(config.randomMin, config.randomMax);
      toastLog("随机延迟" + randNum + "分钟");
      sleep(randNum * 60 * 1000);
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
