autojs webview demo for Android_call_webview_js and webview_call_Android_fun

Android_call_webview_js
```
1、 index.html

 mounted(){
    window.Android_call_webview_js = this.Android_call_webview_js
  }

2、 bridgeHandler.js 

Gevent.emit('webviewRunJs','Android_call_webview_js("hi ,call by Android '+ random()+'")')
```

webview_call_Android_fun
```
1、bridgeHandler.js 
module.exports = {
    handle: handle,
    // 注册被调用方法，名称命名： cmd
    toast: toastAction,
    asyn_return:asyn_return
}
function toastAction(params) {
    toast(params.msg);
    return {msg: 'toast提示成功'};
}

2、index.html
 call_Android_func_toast(){
        window.Android.invoke('toast',{msg:'call by webview js '},()=>{
            
        })
    },
```

webview_call_Android_fun_asyn

```
1、bridgeHandler.js  
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

2、index.html
  window.Android.invoke('asyn_return',{},(ret)=>{
    this.Android_call_webview_return_time = (new Date()).toISOString()
    that.Android_call_webview_return_data = ret
})
```