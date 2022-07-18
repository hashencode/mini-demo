/**
 * 微信小程序JavaScriptSDK 精简版
 */

var ERROR_CONF = {
  KEY_ERR: 311,
  KEY_ERR_MSG: "key格式错误",
  PARAM_ERR: 310,
  PARAM_ERR_MSG: "请求参数信息有误",
  SYSTEM_ERR: 600,
  SYSTEM_ERR_MSG: "系统错误",
  WX_ERR_CODE: 1000,
  WX_OK_CODE: 200,
};
var BASE_URL = "https://apis.map.qq.com/ws/";
var URL_DIRECTION = BASE_URL + "direction/v1/";
var MODE = {
  driving: "driving",
  transit: "transit",
};
var Utils = {
  /**
   * md5加密方法
   * 版权所有©2011 Sebastian Tschan，https：//blueimp.net
   */
  safeAdd(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  },
  bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  },
  md5cmn(q, a, b, x, s, t) {
    return this.safeAdd(
      this.bitRotateLeft(
        this.safeAdd(this.safeAdd(a, q), this.safeAdd(x, t)),
        s
      ),
      b
    );
  },
  md5ff(a, b, c, d, x, s, t) {
    return this.md5cmn((b & c) | (~b & d), a, b, x, s, t);
  },
  md5gg(a, b, c, d, x, s, t) {
    return this.md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  },
  md5hh(a, b, c, d, x, s, t) {
    return this.md5cmn(b ^ c ^ d, a, b, x, s, t);
  },
  md5ii(a, b, c, d, x, s, t) {
    return this.md5cmn(c ^ (b | ~d), a, b, x, s, t);
  },
  binlMD5(x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var i;
    var olda;
    var oldb;
    var oldc;
    var oldd;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;

    for (i = 0; i < x.length; i += 16) {
      olda = a;
      oldb = b;
      oldc = c;
      oldd = d;

      a = this.md5ff(a, b, c, d, x[i], 7, -680876936);
      d = this.md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = this.md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = this.md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = this.md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = this.md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = this.md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = this.md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = this.md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = this.md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = this.md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = this.md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = this.md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = this.md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = this.md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = this.md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

      a = this.md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = this.md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = this.md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = this.md5gg(b, c, d, a, x[i], 20, -373897302);
      a = this.md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = this.md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = this.md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = this.md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = this.md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = this.md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = this.md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = this.md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = this.md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = this.md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = this.md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = this.md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

      a = this.md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = this.md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = this.md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = this.md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = this.md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = this.md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = this.md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = this.md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = this.md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = this.md5hh(d, a, b, c, x[i], 11, -358537222);
      c = this.md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = this.md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = this.md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = this.md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = this.md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = this.md5hh(b, c, d, a, x[i + 2], 23, -995338651);

      a = this.md5ii(a, b, c, d, x[i], 6, -198630844);
      d = this.md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = this.md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = this.md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = this.md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = this.md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = this.md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = this.md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = this.md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = this.md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = this.md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = this.md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = this.md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = this.md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = this.md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = this.md5ii(b, c, d, a, x[i + 9], 21, -343485551);

      a = this.safeAdd(a, olda);
      b = this.safeAdd(b, oldb);
      c = this.safeAdd(c, oldc);
      d = this.safeAdd(d, oldd);
    }
    return [a, b, c, d];
  },
  binl2rstr(input) {
    var i;
    var output = "";
    var length32 = input.length * 32;
    for (i = 0; i < length32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
    }
    return output;
  },
  rstr2binl(input) {
    var i;
    var output = [];
    output[(input.length >> 2) - 1] = undefined;
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0;
    }
    var length8 = input.length * 8;
    for (i = 0; i < length8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
    }
    return output;
  },
  rstrMD5(s) {
    return this.binl2rstr(this.binlMD5(this.rstr2binl(s), s.length * 8));
  },
  rstrHMACMD5(key, data) {
    var i;
    var bkey = this.rstr2binl(key);
    var ipad = [];
    var opad = [];
    var hash;
    ipad[15] = opad[15] = undefined;
    if (bkey.length > 16) {
      bkey = this.binlMD5(bkey, key.length * 8);
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5c5c5c5c;
    }
    hash = this.binlMD5(
      ipad.concat(this.rstr2binl(data)),
      512 + data.length * 8
    );
    return this.binl2rstr(this.binlMD5(opad.concat(hash), 512 + 128));
  },
  rstr2hex(input) {
    var hexTab = "0123456789abcdef";
    var output = "";
    var x;
    var i;
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i);
      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
    }
    return output;
  },
  str2rstrUTF8(input) {
    return unescape(encodeURIComponent(input));
  },
  rawMD5(s) {
    return this.rstrMD5(this.str2rstrUTF8(s));
  },
  hexMD5(s) {
    return this.rstr2hex(this.rawMD5(s));
  },
  rawHMACMD5(k, d) {
    return this.rstrHMACMD5(this.str2rstrUTF8(k), str2rstrUTF8(d));
  },
  hexHMACMD5(k, d) {
    return this.rstr2hex(this.rawHMACMD5(k, d));
  },

  md5(string, key, raw) {
    if (!key) {
      if (!raw) {
        return this.hexMD5(string);
      }
      return this.rawMD5(string);
    }
    if (!raw) {
      return this.hexHMACMD5(key, string);
    }
    return this.rawHMACMD5(key, string);
  },
  /**
   * 得到md5加密后的sig参数
   * @param {Object} requestParam 接口参数
   * @param {String} sk签名字符串
   * @param {String} featrue 方法名
   * @return 返回加密后的sig参数
   */
  getSig(requestParam, sk, feature, mode) {
    var sig = null;
    var requestArr = [];
    Object.keys(requestParam)
      .sort()
      .forEach(function (key) {
        requestArr.push(key + "=" + requestParam[key]);
      });
    if (feature == "direction") {
      sig = "/ws/direction/v1/" + mode + "?" + requestArr.join("&") + sk;
    }
    sig = this.md5(sig);
    return sig;
  },

  /**
   * 使用微信接口进行定位
   */
  getWXLocation(success, fail, complete) {
    wx.getLocation({
      type: "gcj02",
      success: success,
      fail: fail,
      complete: complete,
    });
  },

  /**
   * 获取location参数
   */
  getLocationParam(location) {
    if (typeof location == "string") {
      var locationArr = location.split(",");
      if (locationArr.length === 2) {
        location = {
          latitude: location.split(",")[0],
          longitude: location.split(",")[1],
        };
      } else {
        location = {};
      }
    }
    return location;
  },

  /**
   * 回调函数默认处理
   */
  polyfillParam(param) {
    param.success = param.success || function () {};
    param.fail = param.fail || function () {};
    param.complete = param.complete || function () {};
  },

  /**
   * 验证param对应的key值是否为空
   *
   * @param {Object} param 接口参数
   * @param {String} key 对应参数的key
   */
  checkParamKeyEmpty(param, key) {
    if (!param[key]) {
      var errconf = this.buildErrorConfig(
        ERROR_CONF.PARAM_ERR,
        ERROR_CONF.PARAM_ERR_MSG + key + "参数格式有误"
      );
      param.fail(errconf);
      param.complete(errconf);
      return true;
    }
    return false;
  },

  /**
   * 验证location值
   *
   * @param {Object} param 接口参数
   */
  checkLocation(param) {
    var location = this.getLocationParam(param.location);
    if (!location || !location.latitude || !location.longitude) {
      var errconf = this.buildErrorConfig(
        ERROR_CONF.PARAM_ERR,
        ERROR_CONF.PARAM_ERR_MSG + " location参数格式有误"
      );
      param.fail(errconf);
      param.complete(errconf);
      return false;
    }
    return true;
  },

  /**
   * 构造错误数据结构
   * @param {Number} errCode 错误码
   * @param {Number} errMsg 错误描述
   */
  buildErrorConfig(errCode, errMsg) {
    return {
      status: errCode,
      message: errMsg,
    };
  },

  /**
   *
   * 数据处理函数
   * 根据传入参数不同处理不同数据
   * @param {String} feature 功能名称
   * direction 路径规划
   * @param {Object} param 接口参数
   * @param {Object} data 数据
   */
  handleData(param, data, feature) {
    if (feature == "direction") {
      var direction = data.result.routes;
      param.success(data, direction);
    } else {
      param.success(data);
    }
  },

  /**
   * 构造微信请求参数，公共属性处理
   *
   * @param {Object} param 接口参数
   * @param {Object} param 配置项
   * @param {String} feature 方法名
   */
  buildWxRequestConfig(param, options, feature) {
    var that = this;
    options.header = { "content-type": "application/json" };
    options.method = "GET";
    options.success = function (res) {
      var data = res.data;
      if (data.status === 0) {
        that.handleData(param, data, feature);
      } else {
        param.fail(data);
      }
    };
    options.fail = function (res) {
      res.statusCode = ERROR_CONF.WX_ERR_CODE;
      param.fail(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
    };
    options.complete = function (res) {
      var statusCode = +res.statusCode;
      switch (statusCode) {
        case ERROR_CONF.WX_ERR_CODE: {
          param.complete(
            that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg)
          );
          break;
        }
        case ERROR_CONF.WX_OK_CODE: {
          var data = res.data;
          if (data.status === 0) {
            param.complete(data);
          } else {
            param.complete(that.buildErrorConfig(data.status, data.message));
          }
          break;
        }
        default: {
          param.complete(
            that.buildErrorConfig(
              ERROR_CONF.SYSTEM_ERR,
              ERROR_CONF.SYSTEM_ERR_MSG
            )
          );
        }
      }
    };
    return options;
  },

  /**
   * 处理用户参数是否传入坐标进行不同的处理
   */
  locationProcess(param, locationsuccess, locationfail, locationcomplete) {
    var that = this;
    locationfail =
      locationfail ||
      function (res) {
        res.statusCode = ERROR_CONF.WX_ERR_CODE;
        param.fail(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
      };
    locationcomplete =
      locationcomplete ||
      function (res) {
        if (res.statusCode == ERROR_CONF.WX_ERR_CODE) {
          param.complete(
            that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg)
          );
        }
      };
    if (!param.location) {
      that.getWXLocation(locationsuccess, locationfail, locationcomplete);
    } else if (that.checkLocation(param)) {
      var location = Utils.getLocationParam(param.location);
      locationsuccess(location);
    }
  },
};

class QQMapWX {
  /**
   * 构造函数
   *
   * @param {Object} options 接口参数,key 为必选参数
   */
  constructor(options) {
    if (!options.key) {
      throw Error("key值不能为空");
    }
    this.key = options.key;
  }

  /**
   * 路线规划：
   *
   * @param {Object} options 接口参数对象
   *
   * 请求参数结构可以参考
   * https://lbs.qq.com/webservice_v1/guide-road.html
   */
  direction(options) {
    var that = this;
    options = options || {};
    Utils.polyfillParam(options);

    if (Utils.checkParamKeyEmpty(options, "to")) {
      return;
    }

    var requestParam = {
      output: "json",
      key: that.key,
    };

    //to格式处理
    if (typeof options.to == "string") {
      requestParam.to = options.to;
    } else {
      requestParam.to = options.to.latitude + "," + options.to.longitude;
    }
    //初始化局部请求域名
    var SET_URL_DIRECTION = null;
    //设置默认mode属性
    options.mode = options.mode || MODE.driving;

    //设置请求域名
    SET_URL_DIRECTION = URL_DIRECTION + options.mode;

    if (options.from) {
      options.location = options.from;
    }

    if (options.mode == MODE.driving) {
      if (options.from_poi) {
        requestParam.from_poi = options.from_poi;
      }
      if (options.heading) {
        requestParam.heading = options.heading;
      }
      if (options.speed) {
        requestParam.speed = options.speed;
      }
      if (options.accuracy) {
        requestParam.accuracy = options.accuracy;
      }
      if (options.road_type) {
        requestParam.road_type = options.road_type;
      }
      if (options.to_poi) {
        requestParam.to_poi = options.to_poi;
      }
      if (options.from_track) {
        requestParam.from_track = options.from_track;
      }
      if (options.waypoints) {
        requestParam.waypoints = options.waypoints;
      }
      if (options.policy) {
        requestParam.policy = options.policy;
      }
      if (options.plate_number) {
        requestParam.plate_number = options.plate_number;
      }
    }

    if (options.mode == MODE.transit) {
      if (options.departure_time) {
        requestParam.departure_time = options.departure_time;
      }
      if (options.policy) {
        requestParam.policy = options.policy;
      }
    }

    var locationsuccess = function (result) {
      requestParam.from = result.latitude + "," + result.longitude;
      if (options.sig) {
        requestParam.sig = Utils.getSig(
          requestParam,
          options.sig,
          "direction",
          options.mode
        );
      }
      wx.request(
        Utils.buildWxRequestConfig(
          options,
          {
            url: SET_URL_DIRECTION,
            data: requestParam,
          },
          "direction"
        )
      );
    };

    Utils.locationProcess(options, locationsuccess);
  }
}

module.exports = QQMapWX;
