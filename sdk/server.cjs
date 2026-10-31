"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/polyfills.js"(exports2, module2) {
    var constants = require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    if (typeof process.chdir === "function") {
      chdir = process.chdir;
      process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
      };
      if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
    }
    var chdir;
    module2.exports = patch;
    function patch(fs3) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs3);
      }
      if (!fs3.lutimes) {
        patchLutimes(fs3);
      }
      fs3.chown = chownFix(fs3.chown);
      fs3.fchown = chownFix(fs3.fchown);
      fs3.lchown = chownFix(fs3.lchown);
      fs3.chmod = chmodFix(fs3.chmod);
      fs3.fchmod = chmodFix(fs3.fchmod);
      fs3.lchmod = chmodFix(fs3.lchmod);
      fs3.chownSync = chownFixSync(fs3.chownSync);
      fs3.fchownSync = chownFixSync(fs3.fchownSync);
      fs3.lchownSync = chownFixSync(fs3.lchownSync);
      fs3.chmodSync = chmodFixSync(fs3.chmodSync);
      fs3.fchmodSync = chmodFixSync(fs3.fchmodSync);
      fs3.lchmodSync = chmodFixSync(fs3.lchmodSync);
      fs3.stat = statFix(fs3.stat);
      fs3.fstat = statFix(fs3.fstat);
      fs3.lstat = statFix(fs3.lstat);
      fs3.statSync = statFixSync(fs3.statSync);
      fs3.fstatSync = statFixSync(fs3.fstatSync);
      fs3.lstatSync = statFixSync(fs3.lstatSync);
      if (fs3.chmod && !fs3.lchmod) {
        fs3.lchmod = function(path3, mode, cb) {
          if (cb) process.nextTick(cb);
        };
        fs3.lchmodSync = function() {
        };
      }
      if (fs3.chown && !fs3.lchown) {
        fs3.lchown = function(path3, uid, gid, cb) {
          if (cb) process.nextTick(cb);
        };
        fs3.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs3.rename = typeof fs3.rename !== "function" ? fs3.rename : (function(fs$rename) {
          function rename(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs3.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb) cb(er);
            });
          }
          if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
          return rename;
        })(fs3.rename);
      }
      fs3.read = typeof fs3.read !== "function" ? fs3.read : (function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs3, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs3, fd, buffer, offset, length, position, callback);
        }
        if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
        return read;
      })(fs3.read);
      fs3.readSync = typeof fs3.readSync !== "function" ? fs3.readSync : /* @__PURE__ */ (function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs3, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      })(fs3.readSync);
      function patchLchmod(fs4) {
        fs4.lchmod = function(path3, mode, callback) {
          fs4.open(
            path3,
            constants.O_WRONLY | constants.O_SYMLINK,
            mode,
            function(err, fd) {
              if (err) {
                if (callback) callback(err);
                return;
              }
              fs4.fchmod(fd, mode, function(err2) {
                fs4.close(fd, function(err22) {
                  if (callback) callback(err2 || err22);
                });
              });
            }
          );
        };
        fs4.lchmodSync = function(path3, mode) {
          var fd = fs4.openSync(path3, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs4.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs4.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs4.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs4) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs4.futimes) {
          fs4.lutimes = function(path3, at, mt, cb) {
            fs4.open(path3, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb) cb(er);
                return;
              }
              fs4.futimes(fd, at, mt, function(er2) {
                fs4.close(fd, function(er22) {
                  if (cb) cb(er2 || er22);
                });
              });
            });
          };
          fs4.lutimesSync = function(path3, at, mt) {
            var fd = fs4.openSync(path3, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs4.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs4.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs4.closeSync(fd);
              }
            }
            return ret;
          };
        } else if (fs4.futimes) {
          fs4.lutimes = function(_a, _b, _c, cb) {
            if (cb) process.nextTick(cb);
          };
          fs4.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig) return orig;
        return function(target, mode, cb) {
          return orig.call(fs3, target, mode, function(er) {
            if (chownErOk(er)) er = null;
            if (cb) cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig) return orig;
        return function(target, mode) {
          try {
            return orig.call(fs3, target, mode);
          } catch (er) {
            if (!chownErOk(er)) throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig) return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs3, target, uid, gid, function(er) {
            if (chownErOk(er)) er = null;
            if (cb) cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig) return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs3, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er)) throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig) return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0) stats.uid += 4294967296;
              if (stats.gid < 0) stats.gid += 4294967296;
            }
            if (cb) cb.apply(this, arguments);
          }
          return options ? orig.call(fs3, target, options, callback) : orig.call(fs3, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig) return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs3, target, options) : orig.call(fs3, target);
          if (stats) {
            if (stats.uid < 0) stats.uid += 4294967296;
            if (stats.gid < 0) stats.gid += 4294967296;
          }
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/legacy-streams.js"(exports2, module2) {
    var Stream = require("stream").Stream;
    module2.exports = legacy;
    function legacy(fs3) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path3, options) {
        if (!(this instanceof ReadStream)) return new ReadStream(path3, options);
        Stream.call(this);
        var self = this;
        this.path = path3;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding) this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if ("number" !== typeof this.end) {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self._read();
          });
          return;
        }
        fs3.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self.emit("error", err);
            self.readable = false;
            return;
          }
          self.fd = fd;
          self.emit("open", fd);
          self._read();
        });
      }
      function WriteStream(path3, options) {
        if (!(this instanceof WriteStream)) return new WriteStream(path3, options);
        Stream.call(this);
        this.path = path3;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs3.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/clone.js"(exports2, module2) {
    "use strict";
    module2.exports = clone;
    var getPrototypeOf = Object.getPrototypeOf || function(obj) {
      return obj.__proto__;
    };
    function clone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: getPrototypeOf(obj) };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/graceful-fs.js"(exports2, module2) {
    var fs3 = require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone = require_clone();
    var util = require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = /* @__PURE__ */ Symbol.for("graceful-fs.queue");
      previousSymbol = /* @__PURE__ */ Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    function publishQueue(context, queue2) {
      Object.defineProperty(context, gracefulQueue, {
        get: function() {
          return queue2;
        }
      });
    }
    var debug = noop;
    if (util.debuglog)
      debug = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!fs3[gracefulQueue]) {
      queue = global[gracefulQueue] || [];
      publishQueue(fs3, queue);
      fs3.close = (function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs3, fd, function(err) {
            if (!err) {
              resetQueue();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      })(fs3.close);
      fs3.closeSync = (function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs3, arguments);
          resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      })(fs3.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug(fs3[gracefulQueue]);
          require("assert").equal(fs3[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    if (!global[gracefulQueue]) {
      publishQueue(global, fs3[gracefulQueue]);
    }
    module2.exports = patch(clone(fs3));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs3.__patched) {
      module2.exports = patch(fs3);
      fs3.__patched = true;
    }
    function patch(fs4) {
      polyfills(fs4);
      fs4.gracefulify = patch;
      fs4.createReadStream = createReadStream;
      fs4.createWriteStream = createWriteStream;
      var fs$readFile = fs4.readFile;
      fs4.readFile = readFile;
      function readFile(path3, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path3, options, cb);
        function go$readFile(path4, options2, cb2, startTime) {
          return fs$readFile(path4, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path4, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$writeFile = fs4.writeFile;
      fs4.writeFile = writeFile;
      function writeFile(path3, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path3, data, options, cb);
        function go$writeFile(path4, data2, options2, cb2, startTime) {
          return fs$writeFile(path4, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path4, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$appendFile = fs4.appendFile;
      if (fs$appendFile)
        fs4.appendFile = appendFile;
      function appendFile(path3, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path3, data, options, cb);
        function go$appendFile(path4, data2, options2, cb2, startTime) {
          return fs$appendFile(path4, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path4, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$copyFile = fs4.copyFile;
      if (fs$copyFile)
        fs4.copyFile = copyFile;
      function copyFile(src, dest, flags, cb) {
        if (typeof flags === "function") {
          cb = flags;
          flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src2, dest2, flags2, cb2, startTime) {
          return fs$copyFile(src2, dest2, flags2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$readdir = fs4.readdir;
      fs4.readdir = readdir;
      var noReaddirOptionVersions = /^v[0-5]\./;
      function readdir(path3, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path4, options2, cb2, startTime) {
          return fs$readdir(path4, fs$readdirCallback(
            path4,
            options2,
            cb2,
            startTime
          ));
        } : function go$readdir2(path4, options2, cb2, startTime) {
          return fs$readdir(path4, options2, fs$readdirCallback(
            path4,
            options2,
            cb2,
            startTime
          ));
        };
        return go$readdir(path3, options, cb);
        function fs$readdirCallback(path4, options2, cb2, startTime) {
          return function(err, files) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([
                go$readdir,
                [path4, options2, cb2],
                err,
                startTime || Date.now(),
                Date.now()
              ]);
            else {
              if (files && files.sort)
                files.sort();
              if (typeof cb2 === "function")
                cb2.call(this, err, files);
            }
          };
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs4);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs4.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs4.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs4, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs4, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs4, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs4, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path3, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path3, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream(path3, options) {
        return new fs4.ReadStream(path3, options);
      }
      function createWriteStream(path3, options) {
        return new fs4.WriteStream(path3, options);
      }
      var fs$open = fs4.open;
      fs4.open = open;
      function open(path3, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path3, flags, mode, cb);
        function go$open(path4, flags2, mode2, cb2, startTime) {
          return fs$open(path4, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path4, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      return fs4;
    }
    function enqueue(elem) {
      debug("ENQUEUE", elem[0].name, elem[1]);
      fs3[gracefulQueue].push(elem);
      retry();
    }
    var retryTimer;
    function resetQueue() {
      var now = Date.now();
      for (var i = 0; i < fs3[gracefulQueue].length; ++i) {
        if (fs3[gracefulQueue][i].length > 2) {
          fs3[gracefulQueue][i][3] = now;
          fs3[gracefulQueue][i][4] = now;
        }
      }
      retry();
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = void 0;
      if (fs3[gracefulQueue].length === 0)
        return;
      var elem = fs3[gracefulQueue].shift();
      var fn = elem[0];
      var args = elem[1];
      var err = elem[2];
      var startTime = elem[3];
      var lastTime = elem[4];
      if (startTime === void 0) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args);
      } else if (Date.now() - startTime >= 6e4) {
        debug("TIMEOUT", fn.name, args);
        var cb = args.pop();
        if (typeof cb === "function")
          cb.call(null, err);
      } else {
        var sinceAttempt = Date.now() - lastTime;
        var sinceStart = Math.max(lastTime - startTime, 1);
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        if (sinceAttempt >= desiredDelay) {
          debug("RETRY", fn.name, args);
          fn.apply(null, args.concat([startTime]));
        } else {
          fs3[gracefulQueue].push(elem);
        }
      }
      if (retryTimer === void 0) {
        retryTimer = setTimeout(retry, 0);
      }
    }
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry_operation.js"(exports2, module2) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module2.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts;
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(this._errors.length - 1, this._errors.length);
          this._timeouts = this._cachedTimeouts.slice(0);
          timeout = this._timeouts.shift();
        } else {
          return false;
        }
      }
      var self = this;
      var timer = setTimeout(function() {
        self._attempts++;
        if (self._operationTimeoutCb) {
          self._timeout = setTimeout(function() {
            self._operationTimeoutCb(self._attempts);
          }, self._operationTimeout);
          if (self._options.unref) {
            self._timeout.unref();
          }
        }
        self._fn(self._attempts);
      }, timeout);
      if (this._options.unref) {
        timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self._operationTimeoutCb();
        }, self._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/retry@0.12.0/node_modules/retry/lib/retry.js"(exports2) {
    var RetryOperation = require_retry_operation();
    exports2.operation = function(options) {
      var timeouts = exports2.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && options.forever,
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports2.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports2.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports2.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports2.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/retry@0.12.0/node_modules/retry/index.js
var require_retry2 = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/retry@0.12.0/node_modules/retry/index.js"(exports2, module2) {
    module2.exports = require_retry();
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/signals.js"(exports2, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/index.js"(exports2, module2) {
    var process2 = global.process;
    var processOk = function(process3) {
      return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
    };
    if (!processOk(process2)) {
      module2.exports = function() {
        return function() {
        };
      };
    } else {
      assert = require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process2.platform);
      EE = require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process2.__signal_exit_emitter__) {
        emitter = process2.__signal_exit_emitter__;
      } else {
        emitter = process2.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module2.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process2.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process2.emit = originalProcessEmit;
        process2.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module2.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process2.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process2.kill(process2.pid, sig);
          }
        };
      });
      module2.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process2.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process2.emit = processEmit;
        process2.reallyExit = processReallyExit;
      };
      module2.exports.load = load;
      originalProcessReallyExit = process2.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process2.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        originalProcessReallyExit.call(process2, process2.exitCode);
      };
      originalProcessEmit = process2.emit;
      processEmit = function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process2.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process2.exitCode, null);
          emit("afterexit", process2.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/lib/mtime-precision.js
var require_mtime_precision = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/lib/mtime-precision.js"(exports2, module2) {
    "use strict";
    var cacheSymbol = /* @__PURE__ */ Symbol();
    function probe(file, fs3, callback) {
      const cachedPrecision = fs3[cacheSymbol];
      if (cachedPrecision) {
        return fs3.stat(file, (err, stat) => {
          if (err) {
            return callback(err);
          }
          callback(null, stat.mtime, cachedPrecision);
        });
      }
      const mtime = new Date(Math.ceil(Date.now() / 1e3) * 1e3 + 5);
      fs3.utimes(file, mtime, mtime, (err) => {
        if (err) {
          return callback(err);
        }
        fs3.stat(file, (err2, stat) => {
          if (err2) {
            return callback(err2);
          }
          const precision = stat.mtime.getTime() % 1e3 === 0 ? "s" : "ms";
          Object.defineProperty(fs3, cacheSymbol, { value: precision });
          callback(null, stat.mtime, precision);
        });
      });
    }
    function getMtime(precision) {
      let now = Date.now();
      if (precision === "s") {
        now = Math.ceil(now / 1e3) * 1e3;
      }
      return new Date(now);
    }
    module2.exports.probe = probe;
    module2.exports.getMtime = getMtime;
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/lib/lockfile.js
var require_lockfile = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/lib/lockfile.js"(exports2, module2) {
    "use strict";
    var path3 = require("path");
    var fs3 = require_graceful_fs();
    var retry = require_retry2();
    var onExit = require_signal_exit();
    var mtimePrecision = require_mtime_precision();
    var locks = {};
    function getLockFile(file, options) {
      return options.lockfilePath || `${file}.lock`;
    }
    function resolveCanonicalPath(file, options, callback) {
      if (!options.realpath) {
        return callback(null, path3.resolve(file));
      }
      options.fs.realpath(file, callback);
    }
    function acquireLock(file, options, callback) {
      const lockfilePath = getLockFile(file, options);
      options.fs.mkdir(lockfilePath, (err) => {
        if (!err) {
          return mtimePrecision.probe(lockfilePath, options.fs, (err2, mtime, mtimePrecision2) => {
            if (err2) {
              options.fs.rmdir(lockfilePath, () => {
              });
              return callback(err2);
            }
            callback(null, mtime, mtimePrecision2);
          });
        }
        if (err.code !== "EEXIST") {
          return callback(err);
        }
        if (options.stale <= 0) {
          return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
        }
        options.fs.stat(lockfilePath, (err2, stat) => {
          if (err2) {
            if (err2.code === "ENOENT") {
              return acquireLock(file, { ...options, stale: 0 }, callback);
            }
            return callback(err2);
          }
          if (!isLockStale(stat, options)) {
            return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
          }
          removeLock(file, options, (err3) => {
            if (err3) {
              return callback(err3);
            }
            acquireLock(file, { ...options, stale: 0 }, callback);
          });
        });
      });
    }
    function isLockStale(stat, options) {
      return stat.mtime.getTime() < Date.now() - options.stale;
    }
    function removeLock(file, options, callback) {
      options.fs.rmdir(getLockFile(file, options), (err) => {
        if (err && err.code !== "ENOENT") {
          return callback(err);
        }
        callback();
      });
    }
    function updateLock(file, options) {
      const lock3 = locks[file];
      if (lock3.updateTimeout) {
        return;
      }
      lock3.updateDelay = lock3.updateDelay || options.update;
      lock3.updateTimeout = setTimeout(() => {
        lock3.updateTimeout = null;
        options.fs.stat(lock3.lockfilePath, (err, stat) => {
          const isOverThreshold = lock3.lastUpdate + options.stale < Date.now();
          if (err) {
            if (err.code === "ENOENT" || isOverThreshold) {
              return setLockAsCompromised(file, lock3, Object.assign(err, { code: "ECOMPROMISED" }));
            }
            lock3.updateDelay = 1e3;
            return updateLock(file, options);
          }
          const isMtimeOurs = lock3.mtime.getTime() === stat.mtime.getTime();
          if (!isMtimeOurs) {
            return setLockAsCompromised(
              file,
              lock3,
              Object.assign(
                new Error("Unable to update lock within the stale threshold"),
                { code: "ECOMPROMISED" }
              )
            );
          }
          const mtime = mtimePrecision.getMtime(lock3.mtimePrecision);
          options.fs.utimes(lock3.lockfilePath, mtime, mtime, (err2) => {
            const isOverThreshold2 = lock3.lastUpdate + options.stale < Date.now();
            if (lock3.released) {
              return;
            }
            if (err2) {
              if (err2.code === "ENOENT" || isOverThreshold2) {
                return setLockAsCompromised(file, lock3, Object.assign(err2, { code: "ECOMPROMISED" }));
              }
              lock3.updateDelay = 1e3;
              return updateLock(file, options);
            }
            lock3.mtime = mtime;
            lock3.lastUpdate = Date.now();
            lock3.updateDelay = null;
            updateLock(file, options);
          });
        });
      }, lock3.updateDelay);
      if (lock3.updateTimeout.unref) {
        lock3.updateTimeout.unref();
      }
    }
    function setLockAsCompromised(file, lock3, err) {
      lock3.released = true;
      if (lock3.updateTimeout) {
        clearTimeout(lock3.updateTimeout);
      }
      if (locks[file] === lock3) {
        delete locks[file];
      }
      lock3.options.onCompromised(err);
    }
    function lock2(file, options, callback) {
      options = {
        stale: 1e4,
        update: null,
        realpath: true,
        retries: 0,
        fs: fs3,
        onCompromised: (err) => {
          throw err;
        },
        ...options
      };
      options.retries = options.retries || 0;
      options.retries = typeof options.retries === "number" ? { retries: options.retries } : options.retries;
      options.stale = Math.max(options.stale || 0, 2e3);
      options.update = options.update == null ? options.stale / 2 : options.update || 0;
      options.update = Math.max(Math.min(options.update, options.stale / 2), 1e3);
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        const operation = retry.operation(options.retries);
        operation.attempt(() => {
          acquireLock(file2, options, (err2, mtime, mtimePrecision2) => {
            if (operation.retry(err2)) {
              return;
            }
            if (err2) {
              return callback(operation.mainError());
            }
            const lock3 = locks[file2] = {
              lockfilePath: getLockFile(file2, options),
              mtime,
              mtimePrecision: mtimePrecision2,
              options,
              lastUpdate: Date.now()
            };
            updateLock(file2, options);
            callback(null, (releasedCallback) => {
              if (lock3.released) {
                return releasedCallback && releasedCallback(Object.assign(new Error("Lock is already released"), { code: "ERELEASED" }));
              }
              unlock(file2, { ...options, realpath: false }, releasedCallback);
            });
          });
        });
      });
    }
    function unlock(file, options, callback) {
      options = {
        fs: fs3,
        realpath: true,
        ...options
      };
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        const lock3 = locks[file2];
        if (!lock3) {
          return callback(Object.assign(new Error("Lock is not acquired/owned by you"), { code: "ENOTACQUIRED" }));
        }
        lock3.updateTimeout && clearTimeout(lock3.updateTimeout);
        lock3.released = true;
        delete locks[file2];
        removeLock(file2, options, callback);
      });
    }
    function check2(file, options, callback) {
      options = {
        stale: 1e4,
        realpath: true,
        fs: fs3,
        ...options
      };
      options.stale = Math.max(options.stale || 0, 2e3);
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        options.fs.stat(getLockFile(file2, options), (err2, stat) => {
          if (err2) {
            return err2.code === "ENOENT" ? callback(null, false) : callback(err2);
          }
          return callback(null, !isLockStale(stat, options));
        });
      });
    }
    function getLocks() {
      return locks;
    }
    onExit(() => {
      for (const file in locks) {
        const options = locks[file].options;
        try {
          options.fs.rmdirSync(getLockFile(file, options));
        } catch (e) {
        }
      }
    });
    module2.exports.lock = lock2;
    module2.exports.unlock = unlock;
    module2.exports.check = check2;
    module2.exports.getLocks = getLocks;
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/lib/adapter.js
var require_adapter = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/lib/adapter.js"(exports2, module2) {
    "use strict";
    var fs3 = require_graceful_fs();
    function createSyncFs(fs4) {
      const methods = ["mkdir", "realpath", "stat", "rmdir", "utimes"];
      const newFs = { ...fs4 };
      methods.forEach((method) => {
        newFs[method] = (...args) => {
          const callback = args.pop();
          let ret;
          try {
            ret = fs4[`${method}Sync`](...args);
          } catch (err) {
            return callback(err);
          }
          callback(null, ret);
        };
      });
      return newFs;
    }
    function toPromise(method) {
      return (...args) => new Promise((resolve, reject) => {
        args.push((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        method(...args);
      });
    }
    function toSync(method) {
      return (...args) => {
        let err;
        let result;
        args.push((_err, _result) => {
          err = _err;
          result = _result;
        });
        method(...args);
        if (err) {
          throw err;
        }
        return result;
      };
    }
    function toSyncOptions(options) {
      options = { ...options };
      options.fs = createSyncFs(options.fs || fs3);
      if (typeof options.retries === "number" && options.retries > 0 || options.retries && typeof options.retries.retries === "number" && options.retries.retries > 0) {
        throw Object.assign(new Error("Cannot use retries with the sync api"), { code: "ESYNC" });
      }
      return options;
    }
    module2.exports = {
      toPromise,
      toSync,
      toSyncOptions
    };
  }
});

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/index.js
var require_proper_lockfile = __commonJS({
  "../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/node_modules/.pnpm/proper-lockfile@4.1.2/node_modules/proper-lockfile/index.js"(exports2, module2) {
    "use strict";
    var lockfile = require_lockfile();
    var { toPromise, toSync, toSyncOptions } = require_adapter();
    async function lock2(file, options) {
      const release = await toPromise(lockfile.lock)(file, options);
      return toPromise(release);
    }
    function lockSync(file, options) {
      const release = toSync(lockfile.lock)(file, toSyncOptions(options));
      return toSync(release);
    }
    function unlock(file, options) {
      return toPromise(lockfile.unlock)(file, options);
    }
    function unlockSync(file, options) {
      return toSync(lockfile.unlock)(file, toSyncOptions(options));
    }
    function check2(file, options) {
      return toPromise(lockfile.check)(file, options);
    }
    function checkSync(file, options) {
      return toSync(lockfile.check)(file, toSyncOptions(options));
    }
    module2.exports = lock2;
    module2.exports.lock = lock2;
    module2.exports.unlock = unlock;
    module2.exports.lockSync = lockSync;
    module2.exports.unlockSync = unlockSync;
    module2.exports.check = check2;
    module2.exports.checkSync = checkSync;
  }
});

// ensembles/lesson/runtime/server.ts
var server_exports = {};
__export(server_exports, {
  appendStoreOperation: () => appendStoreOperation,
  maintainStore: () => maintainStore,
  readStore: () => readStore,
  runOpusTask: () => runOpusTask,
  startLessonApplication: () => startLessonApplication,
  throwIfOpusCancelled: () => throwIfOpusCancelled,
  withLessonRequest: () => withLessonRequest,
  withStoreWriteLock: () => withStoreWriteLock
});
module.exports = __toCommonJS(server_exports);
var import_node_http = __toESM(require("node:http"), 1);
var import_promises2 = __toESM(require("node:fs/promises"), 1);
var import_node_path2 = __toESM(require("node:path"), 1);
var import_node_crypto2 = require("node:crypto");
var import_node_stream = require("node:stream");
var import_node_async_hooks = require("node:async_hooks");

// ../../../Users/p/Codes/openplaybook/rdfz-ai-teaching-platform/packages/json-store/src/index.ts
var import_node_util = require("node:util");
var import_node_crypto = require("node:crypto");
var import_promises = __toESM(require("node:fs/promises"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_proper_lockfile = __toESM(require_proper_lockfile(), 1);
var OPS_DIR = "ops";
var TMP_DIR = ".tmp";
var SNAPSHOT_FILE = "snapshot.json";
var LOCK_TARGET = ".maintenance";
var OP_FILE_RE = /^\d{8}T\d{6}\.\d{3}Z(?:\.[A-Za-z0-9_-]+)?\.json$/;
var LOCK_RETRY_MS = 25;
var AUTO_COMPACT_MAX_OPERATIONS = 16;
var AUTO_COMPACT_MAX_BYTES = 256 * 1024;
function jsonStorePaths(directory) {
  return {
    root: directory,
    snapshot: import_node_path.default.join(directory, SNAPSHOT_FILE),
    ops: import_node_path.default.join(directory, OPS_DIR),
    temp: import_node_path.default.join(directory, TMP_DIR),
    lockTarget: import_node_path.default.join(directory, LOCK_TARGET)
  };
}
var committedListeners = /* @__PURE__ */ new Map();
async function withStoreWriteLock(directory, run) {
  await import_promises.default.mkdir(directory, { recursive: true });
  const release = await (0, import_proper_lockfile.lock)(import_node_path.default.join(directory, ".domain-write"), {
    realpath: false,
    stale: 6e4,
    update: 15e3,
    retries: { retries: 80, minTimeout: LOCK_RETRY_MS, maxTimeout: 250 }
  });
  try {
    return await run();
  } finally {
    await release();
  }
}
function committed(directory, change) {
  for (const notify of committedListeners.get(import_node_path.default.resolve(directory)) ?? []) {
    try {
      notify(change);
    } catch {
    }
  }
}
var lastOperationTime = 0;
var transientWriteErrors = /* @__PURE__ */ new Set(["EIO", "EAGAIN", "EBUSY", "ETIMEDOUT", "ESTALE", "EMFILE", "ENFILE"]);
async function appendStoreOperation(directory, value) {
  validateOperation(value);
  const paths = jsonStorePaths(directory);
  lastOperationTime = Math.max(Date.now(), lastOperationTime + 1);
  const fileName = `${new Date(lastOperationTime).toISOString().replaceAll("-", "").replaceAll(":", "")}.${(0, import_node_crypto.randomUUID)()}.json`;
  const filePath = import_node_path.default.join(paths.ops, fileName), tempPath = import_node_path.default.join(paths.temp, `${(0, import_node_crypto.randomUUID)()}.json`);
  const content = `${JSON.stringify(value)}
`;
  const confirm = () => {
    committed(directory, { operation: value });
    return { fileName, filePath };
  };
  for (let attempt = 0; ; attempt++) {
    try {
      await ensureStore(paths);
      await writeSyncedFile(tempPath, content);
      await import_promises.default.link(tempPath, filePath);
      return confirm();
    } catch (error) {
      if (errorCode(error) === "EEXIST" || transientWriteErrors.has(errorCode(error) ?? "")) {
        const saved = await import_promises.default.readFile(filePath, "utf8").catch(() => void 0);
        if (saved === content) return confirm();
      }
      if (attempt >= 2 || !transientWriteErrors.has(errorCode(error) ?? "")) throw error;
      await sleep(100 * (attempt + 1));
    } finally {
      await import_promises.default.unlink(tempPath).catch(() => {
      });
    }
  }
}
async function readStoreIncremental(directory, previous, options = {}) {
  const paths = jsonStorePaths(directory);
  for (; ; ) {
    try {
      options.signal?.throwIfAborted();
      await waitForMaintenance(paths.lockTarget, options.signal);
      const stamp = await readSnapshotStamp(paths.snapshot);
      const files = await listOperationFiles(paths.ops);
      const reuse = previous?.stamp === stamp && previous.operations.every((file, i) => files[i] === file);
      const added = reuse ? files.slice(previous.operations.length) : files;
      const snapshot = reuse ? previous.value : (await readSnapshot(paths.snapshot)).value;
      const operations = await Promise.all(added.map(async (file) => asOperation(await readJson(import_node_path.default.join(paths.ops, file)))));
      if (stamp !== await readSnapshotStamp(paths.snapshot) || await isMaintenanceLocked(paths.lockTarget)) continue;
      if (reuse && !added.length) return previous;
      const changed = new Set(operations.flatMap((operation) => Object.keys(operation)));
      const value = { ...snapshot };
      if (reuse) {
        for (const key of changed) if (value[key] !== void 0) value[key] = structuredClone(value[key]);
      }
      for (const operation of operations) applyStoreOperationInPlace(value, operation);
      if (!reuse) for (const key of /* @__PURE__ */ new Set([...Object.keys(previous?.value ?? {}), ...Object.keys(value)])) {
        if (previous && (0, import_node_util.isDeepStrictEqual)(previous.value[key], value[key])) {
          if (Object.hasOwn(value, key)) value[key] = previous.value[key];
          changed.delete(key);
        } else changed.add(key);
      }
      return { value, stamp, operations: files, changedKeys: [...changed] };
    } catch (error) {
      if (errorCode(error) === "ENOENT") continue;
      throw error;
    }
  }
}
async function readStore(directory) {
  return (await readStoreIncremental(directory)).value;
}
async function compactStoreThrough(paths, boundary, wait = true) {
  await ensureStore(paths);
  await withMaintenanceLock(paths, async () => {
    const opFiles = await listOperationFiles(paths.ops);
    const compacted = boundary === null ? opFiles : opFiles.filter((fileName) => fileName <= boundary);
    if (compacted.length === 0) return;
    const state = await readJson(paths.snapshot);
    for (const fileName of compacted) {
      applyStoreOperationInPlace(state, asOperation(await readJson(import_node_path.default.join(paths.ops, fileName))));
    }
    await writeJsonAtomic(paths.snapshot, state);
    await Promise.all(compacted.map((fileName) => import_promises.default.unlink(import_node_path.default.join(paths.ops, fileName)).catch((error) => {
      if (errorCode(error) !== "ENOENT") throw error;
    })));
  }, wait);
}
function applyStoreOperationInPlace(current, operation) {
  for (const [id, rawPatch] of Object.entries(operation)) {
    if (rawPatch === null) {
      delete current[id];
      continue;
    }
    if (!isRecord(rawPatch)) throw new Error(`json_store_invalid_record_patch:${id}`);
    const patch = withoutInsert(rawPatch);
    if (rawPatch.__insert === true) {
      current[id] = patch;
      continue;
    }
    const currentRecord = current[id];
    if (isRecord(currentRecord)) mergeRecordInPlace(currentRecord, patch);
  }
}
async function ensureStore(paths) {
  await import_promises.default.mkdir(paths.ops, { recursive: true });
  await import_promises.default.mkdir(paths.temp, { recursive: true });
  try {
    await import_promises.default.access(paths.snapshot);
  } catch (error) {
    if (errorCode(error) !== "ENOENT") throw error;
    const temporary = import_node_path.default.join(paths.temp, `${(0, import_node_crypto.randomUUID)()}.json`);
    try {
      await writeSyncedFile(temporary, "{}\n");
      await import_promises.default.link(temporary, paths.snapshot).catch((error2) => {
        if (errorCode(error2) !== "EEXIST") throw error2;
      });
    } finally {
      await import_promises.default.unlink(temporary).catch((error2) => {
        if (errorCode(error2) !== "ENOENT") throw error2;
      });
    }
  }
}
async function withMaintenanceLock(paths, run, wait = true) {
  const release = await (0, import_proper_lockfile.lock)(paths.lockTarget, {
    realpath: false,
    stale: 6e4,
    update: 15e3,
    retries: wait ? { retries: 80, minTimeout: LOCK_RETRY_MS, maxTimeout: 250 } : 0
  }).catch((error) => {
    if (!wait && errorCode(error) === "ELOCKED") return void 0;
    throw error;
  });
  if (!release) return;
  try {
    await run();
  } finally {
    await release();
  }
}
async function waitForMaintenance(lockTarget, signal) {
  while (await isMaintenanceLocked(lockTarget)) {
    signal?.throwIfAborted();
    await sleep(LOCK_RETRY_MS);
  }
}
async function isMaintenanceLocked(lockTarget) {
  return (0, import_proper_lockfile.check)(lockTarget, { realpath: false }).catch((error) => {
    if (errorCode(error) === "ENOENT") return false;
    throw error;
  });
}
async function readSnapshot(snapshotPath) {
  try {
    const [value, stamp] = await Promise.all([readJson(snapshotPath), readSnapshotStamp(snapshotPath)]);
    return { value: asRecord(value, "snapshot"), stamp };
  } catch (error) {
    if (errorCode(error) === "ENOENT") return { value: {}, stamp: "missing" };
    throw error;
  }
}
async function readSnapshotStamp(snapshotPath) {
  try {
    const stat = await import_promises.default.stat(snapshotPath);
    return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}`;
  } catch (error) {
    if (errorCode(error) === "ENOENT") return "missing";
    throw error;
  }
}
async function listOperationFiles(opsDir) {
  try {
    const entries = await import_promises.default.readdir(opsDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && OP_FILE_RE.test(entry.name)).map((entry) => entry.name).sort();
  } catch (error) {
    if (errorCode(error) === "ENOENT") return [];
    throw error;
  }
}
async function maintainStore(directory) {
  const paths = jsonStorePaths(directory);
  const operationFiles = await listOperationFiles(paths.ops);
  const boundary = operationFiles.at(-1) ?? null;
  if (!boundary) return;
  if (operationFiles.length >= AUTO_COMPACT_MAX_OPERATIONS) {
    await compactStoreThrough(paths, boundary, false);
    return;
  }
  let bytes = 0;
  for (const fileName of operationFiles) {
    try {
      bytes += (await import_promises.default.stat(import_node_path.default.join(paths.ops, fileName))).size;
    } catch (error) {
      if (errorCode(error) === "ENOENT") continue;
      throw error;
    }
    if (bytes >= AUTO_COMPACT_MAX_BYTES) {
      await compactStoreThrough(paths, boundary, false);
      return;
    }
  }
}
async function readJson(filePath) {
  return JSON.parse(await import_promises.default.readFile(filePath, "utf8"));
}
async function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.${(0, import_node_crypto.randomUUID)()}.tmp`;
  await writeSyncedFile(tempPath, `${JSON.stringify(value, null, 2)}
`);
  await import_promises.default.rename(tempPath, filePath);
}
async function writeSyncedFile(filePath, content) {
  const handle = await import_promises.default.open(filePath, "wx");
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
}
function mergeRecordInPlace(current, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      delete current[key];
      continue;
    }
    const previous = current[key];
    if (isRecord(previous) && isRecord(value)) {
      mergeRecordInPlace(previous, value);
      continue;
    }
    current[key] = value;
  }
}
function withoutInsert(value) {
  const rest = { ...value };
  delete rest.__insert;
  return rest;
}
function validateOperation(value) {
  for (const [id, patch] of Object.entries(value)) {
    if (patch !== null && !isRecord(patch)) throw new Error(`json_store_invalid_record_patch:${id}`);
  }
}
function asOperation(value) {
  const operation = asRecord(value, "operation");
  validateOperation(operation);
  return operation;
}
function asRecord(value, label) {
  if (!isRecord(value)) throw new Error(`json_store_invalid_${label}`);
  return value;
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function errorCode(error) {
  return error?.code;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ensembles/lesson/runtime/server.ts
var activity = new import_node_async_hooks.AsyncLocalStorage();
function withLessonRequest(root, signal, task) {
  return activity.run({ root, signal }, task);
}
function throwIfOpusCancelled() {
  activity.getStore()?.signal.throwIfAborted();
}
async function runOpusTask(root, task) {
  const scope = activity.getStore();
  if (!scope || scope.root !== root) throw Error("application_scope_denied");
  scope.signal.throwIfAborted();
  return task(scope.signal);
}
var calls = /* @__PURE__ */ new Map();
process.on("message", (message) => {
  const m = message;
  if (m?.type !== "lesson:model-result") return;
  const call = calls.get(m.id);
  if (!call) return;
  if (m.error) {
    call.error = m.error;
    call.done = true;
    call.reject(Error(m.error));
  } else if (m.done) {
    call.done = true;
    call.resolve(m.value);
  } else call.chunks.push(m.chunk);
  call.wake?.();
});
var sequence = 0;
function modelCall(requestId, method, input) {
  const signal = activity.getStore()?.signal;
  signal?.throwIfAborted();
  const id = String(++sequence);
  let resolve, reject;
  const promise = new Promise((ok, bad) => {
    resolve = ok;
    reject = bad;
  });
  promise.catch(() => {
  });
  const state = { chunks: [], done: false, error: void 0, wake: void 0, resolve, reject };
  calls.set(id, state);
  if (!process.send) throw Error("application_host_unavailable");
  const { signal: ignored, ...payload } = input;
  void ignored;
  const abort = () => {
    state.error = "application_request_cancelled";
    state.done = true;
    reject(Error(state.error));
    state.wake?.();
    calls.delete(id);
  };
  signal?.addEventListener("abort", abort, { once: true });
  promise.finally(() => signal?.removeEventListener("abort", abort)).catch(() => {
  });
  process.send({ type: "lesson:model", id, requestId, method, input: payload });
  return { id, state, promise };
}
function services(requestId) {
  return { chatCompletion: async (input) => {
    const call = modelCall(requestId, "chatCompletion", input);
    try {
      return await call.promise;
    } finally {
      calls.delete(call.id);
    }
  }, async *chatCompletionStream(input) {
    const call = modelCall(requestId, "chatCompletionStream", input);
    try {
      while (!call.state.done || call.state.chunks.length) {
        if (call.state.chunks.length) yield call.state.chunks.shift();
        else await new Promise((resolve) => {
          call.state.wake = resolve;
        });
      }
      if (call.state.error) throw Error(call.state.error);
    } finally {
      calls.delete(call.id);
    }
  } };
}
var types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".pdf": "application/pdf", ".wasm": "application/wasm" };
function startLessonApplication(handler) {
  const root = import_node_path2.default.resolve("public"), prefix = "/lesson-app/" + process.env.RDFZ_LESSON_ID;
  const token = process.env.RDFZ_APPLICATION_TOKEN;
  if (!token) throw Error("application_host_required");
  const server = import_node_http.default.createServer(async (req, res) => {
    const auth = String(req.headers["x-rdfz-application-token"] ?? "");
    if (auth.length !== token.length || !(0, import_node_crypto2.timingSafeEqual)(Buffer.from(auth), Buffer.from(token))) {
      res.writeHead(403).end();
      return;
    }
    const controller = new AbortController();
    res.on("close", () => {
      if (!res.writableFinished) controller.abort();
    });
    try {
      const url = new URL(req.url ?? "/", String(req.headers["x-forwarded-proto"] ?? "https") + "://" + String(req.headers["x-forwarded-host"] ?? "localhost"));
      if (url.pathname !== prefix && !url.pathname.startsWith(prefix + "/")) {
        res.writeHead(404).end();
        return;
      }
      const relative = decodeURIComponent(url.pathname.slice(prefix.length)).replace(/^\//, "");
      if (relative === "api" || relative.startsWith("api/")) {
        const raw = JSON.parse(Buffer.from(String(req.headers["x-rdfz-application-context"] ?? ""), "base64url").toString());
        if (raw.context?.opusId !== process.env.RDFZ_LESSON_ID || raw.context?.opusRootDir !== process.env.RDFZ_OPUS_ROOT) throw Error("application_context_invalid");
        const request = new Request(url, { method: req.method, headers: new Headers(req.headers), body: ["GET", "HEAD"].includes(req.method ?? "GET") ? void 0 : import_node_stream.Readable.toWeb(req), signal: controller.signal, duplex: "half" });
        const response = await withLessonRequest(raw.context.opusRootDir, controller.signal, () => handler({ request, context: raw.context, security: raw.security, pathSegments: ["api", ...relative.split("/").slice(1)], runtimeServices: services(raw.requestId) }));
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (!response.body) {
          res.end();
          return;
        }
        for await (const chunk of import_node_stream.Readable.fromWeb(response.body)) if (!res.write(chunk)) await new Promise((r) => res.once("drain", r));
        res.end();
        return;
      }
      if (!["GET", "HEAD"].includes(req.method ?? "")) {
        res.writeHead(405).end();
        return;
      }
      const file = import_node_path2.default.resolve(root, relative || "index.html");
      if (file !== root && !file.startsWith(root + import_node_path2.default.sep)) {
        res.writeHead(400).end();
        return;
      }
      const stat = await import_promises2.default.stat(file);
      if (!stat.isFile()) {
        res.writeHead(404).end();
        return;
      }
      const range = String(req.headers.range ?? "").match(/^bytes=(\d+)-(\d*)$/);
      let start = 0, end = stat.size - 1, status = 200;
      if (range) {
        start = Number(range[1]);
        end = range[2] ? Math.min(Number(range[2]), end) : end;
        if (start > end || start >= stat.size) {
          res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
          return;
        }
        status = 206;
      }
      const headers = { "Content-Type": types[import_node_path2.default.extname(file)] ?? "application/octet-stream", "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" };
      if (range) headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
      res.writeHead(status, headers);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      const handle = await import_promises2.default.open(file, "r");
      try {
        for await (const chunk of handle.createReadStream({ start, end, autoClose: false })) if (!res.write(chunk)) await new Promise((r) => res.once("drain", r));
      } finally {
        await handle.close();
      }
      res.end();
    } catch (error) {
      if (!res.headersSent) res.writeHead(error.code === "ENOENT" ? 404 : 500);
      res.end();
    }
  });
  server.listen(Number(process.env.PORT), "127.0.0.1");
  process.on("SIGTERM", () => server.close(() => process.exit()));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  appendStoreOperation,
  maintainStore,
  readStore,
  runOpusTask,
  startLessonApplication,
  throwIfOpusCancelled,
  withLessonRequest,
  withStoreWriteLock
});
