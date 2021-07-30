/** jsBridge交互处理逻辑实现 */
module.exports = {
    handle: handle,
    // 注册被调用方法，名称命名： cmd
    toast: toastAction,
    asyn_return:asyn_return
}

/**
 * 命令调度入口
 * @param {命令} cmd
 * @param {参数} params
 */
function handle(cmd, params) {
    // console.log('bridgeHandler处理 cmd=%s, params=%s', cmd, JSON.stringify(params));
    // 调度方法命名
    let fun = this[cmd];
    if (!fun) {
        throw new Error("cmd= " + cmd + " 没有定义实现");
    }
    return fun(params);
}

/**
 * 处理逻辑例子： toast 提示
 */
function toastAction(params) {
    toast(params.msg);
    return {msg: 'toast提示成功'};
}

function asyn_return(){
    //call webview js
    Gevent.emit('webviewRunJs','Android_call_webview_js("hi ,call by Android '+ random()+'")')
    return function(callback){
        let ret = random()
        setTimeout(function(){
            callback(ret)
        },1000)
        /**
         *  if run in other thread ,you need use ui.run
        */
        // ui.fun(function(){
        //     //make it run in ui thread
        //     setTimeout(function(){
        //         callback(ret)
        //     },1000)
        // })
        
    }
}