"ui";
Gevent  =  events.emitter(); 
let  bridgeHandler = require('./handler/bridgeHandler.js');
ui.layout(
    <vertical>
        <webview id="webview" w="*" h="*"/>
    </vertical>
);
webView = ui.findById("webview");
android.webkit.WebView.setWebContentsDebuggingEnabled(true);
var client = android.webkit.WebViewClient;

let jsBridge = files.read("./webviewUI/jsBridge.ts");
var t = new JavaAdapter(client, {
    onPageFinished: function(view, url) {
        try {
            callJavaScript(webView, jsBridge, null);
        } catch(e) {
            console.error(e)
        }
        Gevent.on('webviewRunJs',function(s){
           ui.run(()=>{
               callJavaScript(webView, s, null);
           })
        })
    },
    shouldOverrideUrlLoading: (webView, request) => {

        let url = '';
        try {
            url = (request.a && request.a.a) || (request.url);
            if (url instanceof android.net.Uri) {
                url = url.toString();
            }
            if (url.startsWith("jsbridge://")) {
                let uris = url.split("/");
                let cmd = uris[2];
                let callId = uris[3];
                let params = java.net.URLDecoder.decode(uris[4], "UTF-8");
                //      console.log('AutoJs处理JavaScript调用请求: callId=%s, cmd=%s, params=%s', callId, cmd, params);
                let result = null;
                try {
                    result = bridgeHandler.handle(cmd, JSON.parse(params));
                } catch (e) {
                    console.trace(e);
                    result = {message: e.message};
                }
                result = result || {};
                if(typeof result == "function"){
                    result((r)=>{
                        webView.loadUrl("javascript:window.Android.callback({'callId':" + callId + ", 'params': " + JSON.stringify(r) + "});");
                    })
                }else{
                    webView.loadUrl("javascript:window.Android.callback({'callId':" + callId + ", 'params': " + JSON.stringify(result) + "});");
                }

            } else if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://") || url.startsWith("ws://") || url.startsWith("wss://")) {
                webView.loadUrl(url);
            } else {
                confirm("允许网页打开APP？").then(value => {
                    //当点击确定后会执行这里, value为true或false, 表示点击"确定"或"取消"
                    if (value) {
                        importPackage(android.net);
                        let uri = Uri.parse(url);
                        app.startActivity(new Intent(Intent.ACTION_VIEW).setData(uri).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP));
                    }
                });
            }
            // 返回true代表自定义处理，返回false代表触发webview加载
            return true;
        } catch (e) {
            if (e.javaException instanceof android.content.ActivityNotFoundException) {
                webView.loadUrl(url);
            } else {
                console.trace(e);
                toastLog('无法打开URL: ' + url);
            }
        }
    },
    onReceivedError: (webView, webResourceRequest , webResourceError ) => {
        let url = webResourceRequest.getUrl();
        let errorCode = webResourceError.getErrorCode();
        let description = webResourceError.getDescription();
        console.trace(errorCode + " " + description + " " + url);
    }
})
webView.setWebViewClient(t);


let html = files.path("./webviewUI/index.html");
webView.loadUrl("file://" + html);

function callJavaScript(webViewWidget, script, callback) {
    try {
        //console.log(webViewWidget != null, "webView控件为空");
        webViewWidget.evaluateJavascript("javascript:" + script, new JavaAdapter(android.webkit.ValueCallback, {
            onReceiveValue: (val) => {
                if (callback) {
                    callback(val);
                }
            }
        }));
    } catch (e) {
        console.error("执行JavaScript失败");
        console.trace(e);
    }
}
