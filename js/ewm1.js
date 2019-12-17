var code = null;
var userId = null;
var deviceId = null;
//var mphone = null;
var mphone = 15061228629; //测试用
var datalist = [];
var selDate = null;
$(function () {
    // $.ajaxSettings.async = false;
    initBasicSettings();
});

function initBasicSettings() {
    //获取人物信息
    code = util.request.QueryString('code');
    if (code == '' || code == null) {
        layer.msg('获取用户信息CODE失败', {
            time: 2000,
            icon: 2
        });
        return;
    }
    if (util.request.QueryString('date') != null) {
        selDate = util.request.QueryString('date');
    }
    initUserId(code);
}
function initUserId(code) {
    //util.ajaxget1(urlIpLx + 'forward/oauth?code=' + code ,
    util.ajaxget1(urlIpLx + 'forward/oauth?code=' + code + '&isTest=true',//测试用

        function (data) {
            if (data.errcode == '0') {
                userId = data.userId;
                deviceId = data.deviceId;
                //initUserInfo(userId);
                initUserInfo('370882198810110411');//测试用
            } else {
                layer.msg('获取用户信息失败', {
                    time: 1000,
                    icon: 2
                });
            }
        },
        function () {
            layer.msg('获取用户信息失败', {
                time: 1000,
                icon: 2
            });
        });
}
function initUserInfo(userid) {
    var param = {
        'url': urlIpEweb + 'blueLetter/getUserInfoById',
        'header': '{"Content-Type":"application/json"}',
        'content': '{"userid":"' + userid + '"}',
        'userid': userId,
        'deviceid': deviceId,
        'oprate': 1,
        'code': code
    };
    util.ajax1(param, urlIpLx + 'forward/httpJsonPostRequestByForm',
        function (data) {
            var obj = null;
            try {
                obj = JSON.parse(data.content);
            } catch (e) {
                layer.msg('解析数据失败', {
                    time: 2000,
                    icon: 2
                });
                console.log(e.message)
                return;
            }
            if (obj.errcode == '0') {
                if (obj.data[0].mbileNumber) {
                    //mphone = data.data[0].mbileNumber;
                    //测试用
                    if (selDate == null) {
                        selDate = formatDateTime(new Date());
                    }
                    getReList(selDate, mphone);
                    initDate();
                } else {
                    layer.msg('获取手机号失败', {
                        time: 1000,
                        icon: 2
                    });
                }
            } else {
                layer.msg('获取手机号失败', {
                    time: 1000,
                    icon: 2
                });
            }
        },
        function () {
            layer.msg('获取手机号失败', {
                time: 1000,
                icon: 2
            });
        });
}
function initDate() {
    var $promo = $('#mydatepicker');
    $promo.datepicker({
        startDate: new Date(new Date(selDate.replace(/-/,'/'))),
        language: 'cn',
        onSelect: function onSelect(fd, date) {
            selDate = formatDateTime(date);
            getReList(selDate, mphone);
            //进行查询操作
        }
    });
    $promo.data('datepicker').selectDate(new Date(selDate.replace(/-/,'/')));
}
function getReList(time, phone) {
    var index = layer.load();
    var param = {
        'url': urlIpEweb + 'blueLetter/getPhoneControlResult',
        'header': '{"Content-Type":"application/json"}',
        'content': '{"sTime":"' + time + '","phone":"' + phone + '"}',
        'userid': userId,
        'deviceid': deviceId,
        'oprate': 1,
        'code': code
    };
    util.ajax1(param, urlIpLx + 'forward/httpJsonPostRequestByForm',
        function (data) {
            layer.close(index);
            var obj = null;
            try {
                obj = JSON.parse(data.content);
            } catch (e) {
                layer.msg('解析数据失败', {
                    time: 2000,
                    icon: 2
                });
                console.log(e.message)
                return;
            }
            fillDaata(obj.obj);
        },
        function () {
            layer.close(index);
            layer.msg('获取数据失败', {
                time: 1000,
                icon: 2
            });
        });
}
function fillDaata(data) {
    datalist = data;
    $("#ulResult").empty();
    $("#ulResult").append(item);
    for (var i = 0; i < data.length; i++) {
        var itemdata = data[i];
        var id = itemdata.id;
        var itime = itemdata.alarm_time;
        var idesc = itemdata.cwDesc;
        if (idesc.length > 42) {
            idesc = idesc.substring(0, 42) + '...';
        }
        var signclass = 'sign-img0';
        if (itemdata.handleStatus == '0') {
            var signclass = 'sign-img1';
        }
        var item = '<li class="flag">'
            + '<div class="figure">'
            + ' <div class="time-ymd">' + formatDateTime1(itime) + '</div>'
            + '<div class="time-hms">' + formatDateTime2(itime) + '</div></div>'
            + '<div class="flag-content" onclick="viewMap(' + id + ')">' + idesc + '</div>'
            + '<div class="flag-sign"><div class="' + signclass + '" onclick="sign(' + i + ')"></div></div>'
            + '<div class="flag-feedback"><div onclick="feedBack(' + i + ')"> <div class="feed-img"></div>'
            + '<div class="feed-text">反馈</div></div></div></li>';
        $("#ulResult").append(item);
    }
}
function feedBack(i) {
    if (datalist[i].handleStatus == '0') {
        layer.msg('请先签收!', {
            time: 2000,
            icon: 2
        });
        return;
    }

    if (datalist[i].handleResult) {
        layer.alert(datalist[i].handleResult, {
            title: '反馈意见'
        });
    } else {//没有反馈过
        layer.prompt({
            title: '反馈意见',
            formType: 2,
            area: ['6rem', '6rem']
        }, function (val, index) {
            layer.close(index);
            //去除反馈意见的回车符
            //console.log(val.replace(/[\r\n]/g,''))
            var index = layer.load();
            var param = {
                'url': urlIpEweb + 'blueLetter/bkjgOperate',
                'header': '{"Content-Type":"application/json"}',
                'content': '{"signType":"蓝信端","jgId":"' + datalist[i].id + '","phone":"' + mphone + '","operateType":"feedback","feedBackContent":"' + val.replace(/[\r\n]/g,'') + '"}',
                'userid': userId,
                'deviceid': deviceId,
                'oprate': 1,
                'code': code
            };
            util.ajax1(param, urlIpLx + 'forward/httpJsonPostRequestByForm',
                function (data) {
                    layer.close(index);
                    var obj = null;
                    try {
                        obj = JSON.parse(data.content);
                    } catch (e) {
                        layer.msg('解析数据失败', {
                            time: 2000,
                            icon: 2
                        });
                        console.log(e.message)
                        return;
                    }
                    if (obj.code == 200) {
                        layui.layer.msg('反馈成功', {
                            time: 1000,
                            icon: 1
                        });
                        getReList(selDate, mphone);
                    } else {
                        layer.msg('反馈失败', {
                            time: 1000,
                            icon: 2
                        });
                    }
                },
                function () {
                    layer.close(index);
                    layer.msg('反馈失败', {
                        time: 1000,
                        icon: 2
                    });
                });
        });
    }

}
function sign(i) {
    if (datalist[i].handleStatus == '1') {
        return;
    } else {
        var index = layer.load();
        var param = {
            'url': urlIpEweb + 'blueLetter/bkjgOperate',
            'header': '{"Content-Type":"application/json"}',
            'content': '{"signType":"蓝信端","jgId":"' + datalist[i].id + '","phone":"' + mphone + '","operateType":"sign","handleStatus":"1"}',
            'userid': userId,
            'deviceid': deviceId,
            'oprate': 1,
            'code': code
        };
        util.ajax1(param, urlIpLx + 'forward/httpJsonPostRequestByForm',
            function (data) {
                layer.close(index);
                var obj = null;
                try {
                    obj = JSON.parse(data.content);
                } catch (e) {
                    layer.msg('解析数据失败', {
                        time: 2000,
                        icon: 2
                    });
                    console.log(e.message)
                    return;
                }
                if (obj.code == 200) {
                    layui.layer.msg('签收成功', {
                        time: 1000,
                        icon: 1
                    });
                    getReList(selDate, mphone);
                } else {
                    layer.msg('签收失败', {
                        time: 1000,
                        icon: 2
                    });
                }
            },
            function () {
                layer.close(index);
                layer.msg('签收失败', {
                    time: 1000,
                    icon: 2
                });
            });
    }

}
function backToMain() {
    window.opener = null;
    window.open('', '_self');
    window.close();
}
function viewMap(reid) {
    self.location = "./eWebMobile2.html?reid=" + reid + "&code=" + code + "&userId=" + userId + "&deviceId=" + deviceId + "&date=" + selDate;
}
function formatDateTime(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d;
}
function formatDateTime1(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return m + '月' + d + '日';
}
function formatDateTime2(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return h + ':' + minute;
}