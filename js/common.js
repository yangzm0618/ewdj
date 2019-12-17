var urlIpEweb='http://50.113.36.91:8080/';//后端接口IP
//var urlIpEweb='';
//var urlIpLx='http://50.113.36.77:8080/';//蓝信服务接口IP
var urlIpLx='http://50.112.9.47:8099/LXPreWeb/';
var util = {};
util.ajax = function (param, url, sucfun, failfun) {
    //$("#loading").show();
    //document.getElementById('loading').style.display='block';
    $.ajax({
        url: url,// action url
        data: param,
        type: "post",
        cache: false,
        contentType: "application/x-www-form-urlencoded",
        dataType: "json",
        success: function (data) {
            var da = eval(data);
            if (da.hasOwnProperty("islogin")) {
                $("#loading").hide();
                window.location.reload(true);
                return;
            }
            sucfun(data);
            //$("#loading").hide();
        },
        error: function () {
            failfun();
            //$("#loading").hide();
        }
    });

}
//局部刷新页面的form提交
util.ajaxFrom = function (formId, targetId, url, sucfun, failfun) {
    //$("#loading").show();
    //document.getElementById('loading').style.display='block';
    $.ajax({
        target: "#" + targetId,
        url: url,// action url
        data: $("#" + formId).serialize(),
        type: "post",
        cache: false,
        dataType: "json",
        success: function (data) {
            var da = eval(data);
            if (da && da.hasOwnProperty("islogin")) {
                $("#loading").hide();
                window.location.reload(true);
                return;
            }
            sucfun(data);
            //$("#loading").hide();
        },
        error: function () {
            failfun();
            // $("#loading").hide();
        }
    });
}

util.ajax1 = function (param, url, sucfun, failfun) {
    //$("#loading").show();
    //document.getElementById('loading').style.display='block';
    $.ajax({
        url: url,// action url
        data: param,
        type: "post",
        cache: false,
        success: function (data) {
            sucfun(data);
        },
        error: function () {
            failfun();
        }
    });

};
util.ajaxget1 = function (url, sucfun, failfun) {//跨域使用请求 无加载
    $.ajax({
        url: url,// action url
        type: "get",
        cache: false,
        //contentType: "application/json;charset=utf-8",
        success: function (data) {
            sucfun(data);
        },
        error: function () {
            failfun();
        }
    });

};
util.xmlget = function (url, sucfun, failfun) {//跨域使用请求 无加载
    var xhr = createCORSXhr(url, "get");
    xhr.onload = function () {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                alert(xhr.responseText);
                sucfun(xhr.responseText);
            } else {
                console.log(" ajax error...");
            }
        }
    };
    xhr.onerror = function () {
        console.log("error code:" + xhr.status)
        failfun();
    };
    xhr.send(null);
    //创建xhr对象
    function createCORSXhr(url, method) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest !== "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else
            xhr = null;
        return xhr;
    }
};


util.ajax2 = function (param, url, sucfun, failfun) {
    //$("#loading").show();
    //document.getElementById('loading').style.display='block';
    $.ajax({
        url: url,// action url
        data: param,
        type: "post",
        cache: false,
        dataType: "json",
        success: function (data) {
            if (typeof data != "string") {
                var da = eval(data);
                if (da.hasOwnProperty("islogin")) {
                    $("#loading").hide();
                    window.location.reload(true);
                    return;
                }
            }
            sucfun(data);
            //$("#loading").hide();
        },
        error: function () {
            failfun();
            //$("#loading").hide();
        }
    });

};
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function isEmpty(obj) {
    if (obj === null)
        return true;
    if (typeof obj === 'undefined') {
        return true;
    }
    if (typeof obj === 'string') {
        if (obj.trim() === "") {
            return true;
        }
    }
    return false;
}
util.request = {
    QueryString: function (val) {
        var uri = window.location.search;
        var re = new RegExp("" + val + "\=([^\&\?]*)", "ig");
        return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null);
    },
    QueryStrings: function () {
        var uri = window.location.search;
        var re = /\w*\=([^\&\?]*)/ig;
        var retval = [];
        while ((arr = re.exec(uri)) != null)
            retval.push(arr[0]);
        return retval;
    },
    setQuery: function (val1, val2) {
        var a = this.QueryStrings();
        var retval = "";
        var seted = false;
        var re = new RegExp("^" + val1 + "\=([^\&\?]*)$", "ig");
        for (var i = 0; i < a.length; i++) {
            if (re.test(a[i])) {
                seted = true;
                a[i] = val1 + "=" + val2;
            }
        }
        retval = a.join("&");
        return "?" + retval + (seted ? "" : (retval ? "&" : "") + val1 + "=" + val2);
    }
};