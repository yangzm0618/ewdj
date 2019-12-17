var code = null;
var map = null;
$(function () {
    // $.ajaxSettings.async = false;
    initBasicSettings();
});

function initBasicSettings() {
    var reid = util.request.QueryString('reid');
    code = util.request.QueryString('code');
    qureyInfo(reid);
}
function qureyInfo(id) {
    var index = layer.load();
    var param = {
        'url': urlIpEweb + 'blueLetter/getPhoneResultLatLon?id=' + id,
        'header': '{"Content-Type":"application/json"}',
        'userid': util.request.QueryString('userId'),
        'deviceid': util.request.QueryString('deviceId'),
        'oprate': 1,
        'code': code
    };
    util.ajax1(param, urlIpLx + 'forward/httpJsonGetRequest',
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
            fillData(obj.obj);
        },
        function () {
            layer.close(index);
            initMap(null,null);
            layer.msg('获取触网信息失败', {
                time: 2000,
                icon: 2
            });
        });
}
function fillData(data) {

    if (data.photo) {
        var imgdata = 'data:image/png;base64,' + data.photo;
        $("#imginfo").attr('src', imgdata);
    }

    $("#bkinfo").empty();
    var item = '<div><p>任务名称</p>'
        + ' <div>' + data.controlInfo.BKRW + '</div></div>'
        + '<div><p>任务类型</p>'
        + ' <div>' + data.controlInfo.BKLX + '</div></div>'
        + '<div><p>案件编号</p>'
        + ' <div>' + data.controlInfo.CASE_ID + '</div></div>';
    $("#bkinfo").append(item);


    $("#cwinfo").empty();
    var item = '<div><p>地点</p>'
        + ' <div>' + data.cwInfo.CW_ADDR + '</div></div>'
        + '<div><p>详情</p>'
        + ' <div>' + data.cwInfo.CW_DESC + '</div></div>';
    $("#cwinfo").append(item);
    initMap(data.cwInfo.LON, data.cwInfo.LAT);
}

function initMap(lon, lat) {
    map = new BMap.Map("container");
    var point = null;
    if (lon && lat) {//坐标转换
        var tempoint = wgs2bd(parseFloat(lat), parseFloat(lon));
        point = new BMap.Point(tempoint[1], tempoint[0])
        addMarker(point);
    } else {
        point = new BMap.Point(119.02, 33.62);
        layer.msg('暂无坐标位置信息', {
            time: 1500,
            icon: 2
        });
    }
    map.centerAndZoom(point, 16);
    map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
    map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

    // 添加带有定位的导航控件
    var navigationControl = new BMap.NavigationControl({
        // 靠左上角位置
        anchor: BMAP_ANCHOR_TOP_LEFT,
        // 启用显示定位
        enableGeolocation: true
    });
    map.addControl(navigationControl);
    // 添加定位控件
    var geolocationControl = new BMap.GeolocationControl();
    geolocationControl.addEventListener("locationSuccess", function (e) {
        // 定位成功事件
        var address = '';
        address += e.addressComponent.province;
        address += e.addressComponent.city;
        address += e.addressComponent.district;
        address += e.addressComponent.street;
        address += e.addressComponent.streetNumber;
        // alert("当前定位地址为：" + address);
    });
    geolocationControl.addEventListener("locationError", function (e) {
        // 定位失败事件
        //alert(e.message);
    });
    map.addControl(geolocationControl);
    map.addControl(new BMap.ScaleControl());
}
function showInfo() {
    layer.open({
        type: 1,
        shade: false,
        title: false, //不显示标题
        content: $('.enet-cw-info'),
        cancel: function () {
            $('.enet-cw-info').hide();
        }
    });
}
function backPre() {
    self.location = "./eWebMobile1.html?code=" + code + "&date=" + util.request.QueryString('date');
}

function addMarker(point) {
    var myIcon = new BMap.Icon('img/cwjs.png', new BMap.Size(32, 32), {
        imageOffset: new BMap.Size(0, 0), // 指定定位位置
        imageSize: new BMap.Size(28, 30), // 设置图片偏移
        anchor: new BMap.Size(14, 29) // 图标中央下端的尖角位置。
    });
    var marker = new BMap.Marker(point, {icon: myIcon});
    var label = new BMap.Label("触网地点",{offset:new BMap.Size(-12,30)});
    marker.setLabel(label);
    map.addOverlay(marker);
}
//坐标转换
var pi = 3.14159265358979324;
var a = 6378245.0;
var ee = 0.00669342162296594323;
var x_pi = 3.14159265358979324 * 3000.0 / 180.0;


//世界大地坐标转为百度坐标
function wgs2bd(lat, lon) {
    var wgs2gcjR = wgs2gcj(lat, lon);
    var gcj2bdR = gcj2bd(wgs2gcjR[0], wgs2gcjR[1]);
    return gcj2bdR;
}

function gcj2bd(lat, lon) {
    var x = lon, y = lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    var bd_lon = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    var result = [];
    result.push(bd_lat);
    result.push(bd_lon);
    return result;
}

function bd2gcj(lat, lon) {
    var x = lon - 0.0065, y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lon = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    var result = [];
    result.push(gg_lat);
    result.push(gg_lon);
    return result;
}

function wgs2gcj(lat, lon) {
    var dLat = transformLat(lon - 105.0, lat - 35.0);
    var dLon = transformLon(lon - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    var mgLat = lat + dLat;
    var mgLon = lon + dLon;
    var result = [];
    result.push(mgLat);
    result.push(mgLon);
    return result;
}

function transformLat(lat, lon) {
    var ret = -100.0 + 2.0 * lat + 3.0 * lon + 0.2 * lon * lon + 0.1 * lat * lon + 0.2 * Math.sqrt(Math.abs(lat));
    ret += (20.0 * Math.sin(6.0 * lat * pi) + 20.0 * Math.sin(2.0 * lat * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lon * pi) + 40.0 * Math.sin(lon / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lon / 12.0 * pi) + 320 * Math.sin(lon * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLon(lat, lon) {
    var ret = 300.0 + lat + 2.0 * lon + 0.1 * lat * lat + 0.1 * lat * lon + 0.1 * Math.sqrt(Math.abs(lat));
    ret += (20.0 * Math.sin(6.0 * lat * pi) + 20.0 * Math.sin(2.0 * lat * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * pi) + 40.0 * Math.sin(lat / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lat / 12.0 * pi) + 300.0 * Math.sin(lat / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
}

