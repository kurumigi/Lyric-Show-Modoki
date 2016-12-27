﻿//created by tomato111
//e.g.) @import "%fb2k_path%import\common\lib.js"

//============================================
//== Prototype ==================================
//============================================

//-- Replace --
String.prototype.replaceEach = function () { //e.g.) "abc*Bc".replaceEach("b", "e", "c", "f", "\\*", "_", "ig")  /* aef_ef */
    var str = this;
    var flag = arguments[arguments.length - 1];
    if (!(arguments.length % 2))
        throw new Error("Wrong number of arguments");
    if (/[^igm]/.test(flag))
        throw new Error("Unknown flag: \"" + flag + "\"");

    for (var i = 0; i < arguments.length - 1; i += 2) {
        var re = new RegExp(arguments[i], flag);
        str = str.replace(re, arguments[i + 1]);
    }
    return str;
};

String.prototype.toHalfWidthNum = function () { //-- Replace full-width number with half-width number --
    return this.replace(/[０１２３４５６７８９]/g, function (s) { return "０１２３４５６７８９".indexOf(s); });
};

String.prototype.hexNumRefToString = function () { //-- 数値文字参照(16進数, 10進数)を文字列に変換 -- reference https://gist.github.com/myaumyau/4975024
    return this.replace(/&#x([0-9a-f]+);/ig, function (match, $1, idx, all) {
        return String.fromCharCode('0x' + $1);
    });
};

String.prototype.decNumRefToString = function () {
    return this.replace(/&#(\d+);/ig, function (match, $1, idx, all) {
        return String.fromCharCode($1);
    });
};

String.prototype.stringTodecNumRef = function () {
    var ref = "";
    for (var i = 0; i < this.length; i++)
        ref += "&#" + this.charCodeAt(i) + ";";
    return ref;
};

//-- Trim --
String.prototype.trim = function (s) {
    return this.replace(/^[\s　]*|[\s　]*$/g, "");
};

//-- Print --
String.prototype.console = function (s) {
    fb.trace(this + (s ? s : ""));
    return this;
};

Number.prototype.console = function (s) {
    fb.trace(this.toString() + (s ? s : ""));
    return this;
};

Boolean.prototype.console = function (s) {
    fb.trace(this + (s ? s : ""));
    return this;
};

//-- Timer --
Function.prototype.interval = function (time, callback) {
    var __method = this;
    var __callback = callback || function () { };
    this.$$timerid$$ = window.setInterval(function () {
        __method.apply(this, arguments);
        __callback.apply(this, arguments);
    }, time);
};

Function.prototype.timeout = function (time, callback) {
    var __method = this;
    var __callback = callback || function () { };
    this.$$timerid$$ = window.setTimeout(function () {
        __method.apply(this, arguments);
        __callback.apply(this, arguments);
    }, time);
};

Function.prototype.clearInterval = function () {
    window.clearInterval(this.$$timerid$$);
};

Function.prototype.clearTimeout = function () {
    window.clearTimeout(this.$$timerid$$);
};

//============================================
//== Constructor ================================
//============================================

//-- Message --
function Message(text, title, type) {
    this.text = text.replace(/\\n/g, "\n");
    this.title = title;
    this.type = type;
}
Message.prototype.popup = function (s) {
    return new ActiveXObject("WScript.Shell").popup(this.text + (s ? s : ""), 0, this.title, this.type);
};
Message.prototype.trace = function (s) {
    fb.trace(this.text + (s ? s : ""));
};
Message.prototype.ret = function (s) {
    return (this.text + (s ? s : ""));
};
Message.prototype.fbpopup = function (s) {
    fb.ShowPopupMessage(this.text + (s ? s : ""), this.title);
};

//-- Time Logger --
function TraceLog() {
    this.startTime = -1;
}
TraceLog.prototype = {
    start: function (message) {
        this.message = message;
        this.startTime = new Date().getTime();
        fb.trace('[' + message + '] has started');
    },
    stop: function () {
        var current = new Date().getTime();
        var endTime = current - this.startTime;
        fb.trace('[' + this.message + '] has finished at ' + endTime + ' ms');
    }
};

//-- File Dialog --
function FileDialog(exe) {
    var file, proc;
    var ws = new ActiveXObject("WScript.Shell");

    var onReady = function () { };

    this.open = function () {
        proc = ws.Exec(exe);
        (function () {
            if (proc.Status == 0)
                return;
            arguments.callee.clearInterval();
            file = proc.StdOut.ReadAll();
            onReady(file);
        }).interval(100);
    };

    this.setOnReady = function (f) { onReady = f; };
}

//-- Binary Access -- reference http://www2.wbs.ne.jp/~kanegon/doc/code.txt
var scVB = new ActiveXObject("ScriptControl"); // VBScript でサイズ取得と要素アクセスの関数を用意
scVB.Language = "VBScript";
scVB.AddCode("Function vbBinary_getSize(text) : vbBinary_getSize = LenB(text) : End Function");
scVB.AddCode("Function vbBinary_At(text, index) : vbBinary_At = AscB(MidB(text, index + 1, 1)) : End Function");

function Binary(data) { // Binary クラスで VBScript を隠蔽
    this.data = data;
    this.size = scVB.Run("vbBinary_getSize", this.data);
}
Binary.prototype.At = function (index) {
    if (index < 0 || index >= this.size) return 0;
    return scVB.Run("vbBinary_At", this.data, index);
};
Binary.prototype.charAt = function (index) {
    if (index < 0 || index >= this.size) return "";
    return String.fromCharCode(scVB.Run("vbBinary_At", this.data, index));
};
Binary.prototype.getArray = function (n) {
    if (!n || n < 0)
        n = this.size;
    for (var i = 0; i < n; i++)
        this[i] = this.At(i);
};


//-- ini file reader (UTF-8 with BOM)-- reference http://shoji.blog1.fc2.com/blog-entry-130.html
function Ini() {
    this.initialize.apply(this, arguments);
}
Ini.prototype = {
    initialize: function (file, charset) {
        this.clear();
        if (file != null) this.open(file, charset);
    },

    // clearメソッド - 全削除
    clear: function () {
        try { delete this.items; } catch (e) { }
        this.items = new Array();  // 項目
        this.filename = null;    // ファイル名
    },

    // openメソッド - Iniファイルの読込
    open: function (filename, charset) {
        try {
            var stm = new ActiveXObject('ADODB.Stream');
            stm.type = 2;
            stm.charset = charset || GetCharsetFromCodepage(utils.FileTest(file, "chardet"));
            stm.open();
            stm.loadFromFile(filename); // stm.position -> 0

            this.clear();
            var sectionname = null;
            var p = -1;

            while (!stm.EOS) {
                var line = stm.readText(-2);

                line = line.replace(/^[ \t]+/, "");  // 先頭の空白は削除
                if (!line.match(/^(?:;|[ \t]*$)/))    // ;で開始しない, 空行ではない
                {
                    if (line.match(/^\[(.+)\][ \t]*$/))  // セクション行
                    {
                        sectionname = RegExp.$1;
                        this.items[sectionname] = new Array();  // セクション行を追加
                    }
                    else if (sectionname != null && (p = line.indexOf('=')) >= 0) {
                        var keyname = line.substr(0, p).trim();
                        var value = line.substr(p + 1, line.length - p - 1).trim();

                        this.items[sectionname][keyname] = value;
                    }
                }
            }

            this.filename = filename;

            stm.close();
            stm = null; delete stm;
            fso = null; delete fso;

            return true;
        }
        catch (e) {
            this.filename = filename;
            return false;
        }
    },

    // updateメソッド - iniファイルの更新
    update: function (filename) {
        if (filename != null) this.filename = filename;

        try {
            var fso = new ActiveXObject("Scripting.FileSystemObject");  // FileSystemObjectを作成
            var ini = fso.OpenTextFile(this.filename, 2, true)

            for (var sectionname in this.items) {
                ini.WriteLine('[' + sectionname + ']');
                for (var keyname in this.items[sectionname])
                    ini.WriteLine(keyname + '=' + this.items[sectionname][keyname]);
                ini.WriteLine('');
            }
            ini = null; delete ini;
            fso = null; delete fso;

            this.open(this.filename);
            return true;
        }
        catch (e) {
            return false;
        }
    },

    // setItemメソッド - 項目の値設定
    setItem: function (sectionname, keyname, value, updateflag) {
        if (updateflag == null) updateflag = true;

        if (!(sectionname in this.items))
            this.items[sectionname] = new Array();

        this.items[sectionname][keyname] = value;

        if (updateflag && this.filename != null) this.update();
    }
};


//============================================
//== Function ===================================
//============================================

/*インターセプトした関数ではプロトタイプメソッドをnopにすれば出力しない*/
//TraceLog.prototype.start = TraceLog.prototype.stop = function () { /* nop */ }; };

//-- Profiler --
function traceInterceptor(target) {
    var log = new TraceLog;
    for (var property in target) {
        if (typeof target[property] == 'function') {
            var __method = target[property];
            target[property] = function () {
                log.start(property);
                var returnValue = __method.apply(this, arguments);
                log.stop();
                return returnValue;
            };
        }
    }
};

//-- Print --
function console(s) {
    fb.trace(s);
    return s;
}

//-- Color --
function RGBA(r, g, b, a) {
    var res = 0xff000000 | (r << 16) | (g << 8) | (b);
    if (a != undefined) res = (res & 0x00ffffff) | (a << 24);
    return res;
}
function RGB(r, g, b) { return (0xff000000 | (r << 16) | (g << 8) | (b)); }
function getRGB(color) { return [getRed(color), getGreen(color), getBlue(color)]; }
function getRGBA(color) { return [getRed(color), getGreen(color), getBlue(color), getAlpha(color)]; }
function getAlpha(color) { return ((color >> 24) & 0xff); }
function getRed(color) { return ((color >> 16) & 0xff); }
function getGreen(color) { return ((color >> 8) & 0xff); }
function getBlue(color) { return (color & 0xff); }
function RGBAtoRGB(color) { // reference http://stackoverflow.com/questions/2049230/convert-rgba-color-to-rgb

    var TargetR, TargetG, TargetB;
    var BGColorR = 255; // option
    var BGColorG = 255;
    var BGColorB = 255;

    var rgba = getRGBA(color);
    rgba[3] = rgba[3] / 255;

    TargetR = (((1 - rgba[3]) * BGColorR) + Math.round(rgba[3] * rgba[0]));
    TargetG = (((1 - rgba[3]) * BGColorG) + Math.round(rgba[3] * rgba[1]));
    TargetB = (((1 - rgba[3]) * BGColorB) + Math.round(rgba[3] * rgba[2]));

    return RGB(TargetR, TargetG, TargetB);
}
function setAlpha(color, a) { return ((color & 0x00ffffff) | (a << 24)); }

//-- Input Prompt --
function prompt(text, title, defaultText) {
    var sc = new ActiveXObject("ScriptControl");
    var code = 'Function fn(text, title, defaultText)\n'
    + 'fn = InputBox(text, title, defaultText)\n'
    + 'End Function'
    sc.Language = "VBScript";
    sc.AddCode(code);
    return sc.Run("fn", text, title, defaultText);
}

//-- Play Sound --
function playSoundSimple(url) {
    var mp = arguments.callee.mp;
    try {
        if (!mp)
            mp = arguments.callee.mp = new ActiveXObject("WMPlayer.OCX");
        mp.URL = url;
        mp.Controls.Play();
    } catch (e) { }
}

//-- Execute Command --
function FuncCommand(path) {
    var sa = new ActiveXObject("Shell.Application");
    if (!/(?:\\|:\/\/)/.test(path))
        fb.RunMainMenuCommand(path);
    else {
        var ar, arg = null;
        if (/(.*?\.\w{2,4}) (.*)/.test(path)) {
            path = RegExp.$1;
            ar = RegExp.$2.charAt(0);
            arg = (ar != '"' && ar != "/") ? '"' + RegExp.$2 + '"' : RegExp.$2;
        }
        sa.ShellExecute(path, arg, "", "", 1);
    }
}

function FuncCommands(c, MetadbHandle) { // c= a command string or commands array
    if (c)
        if (c instanceof Array)
            for (var i = 0; i < c.length; i++)
                ex(c[i]);
        else
            ex(c);

    function ex(c) {
        if (c.charAt(0) == "<")
            window.NotifyOthers(c.slice(1, -1), "");
        else
            FuncCommand(fb.TitleFormat(c).EvalWithMetadb(MetadbHandle));
    }
}

//-- IOFunc --
function createFolder(objFSO, strFolder) {
    try {
        var strParent = objFSO.GetParentFolderName(strFolder)
        if (!objFSO.FolderExists(strParent))
            arguments.callee(objFSO, strParent);
        objFSO.CreateFolder(strFolder);
    } catch (e) { throw new Error("Couldn't create a folder.") }
}

function writeTextFile(text, file, charset) {
    var bin;
    var UTF8N = /^UTF-8N$/i.test(charset);
    var setEOS = function (pos, buf) {
        stm.Position = pos;
        stm.SetEOS();
        stm.Write(buf);
    }
    var stm = new ActiveXObject('ADODB.Stream');
    stm.type = 2;
    stm.charset = UTF8N ? "UTF-8" : charset;
    stm.open();
    stm.writeText(text); // この地点でBOMが付加される。まず問題ないが、読み取ったファイルがBOMの重複を起こしていた場合を考えて重複チェックを入れる
    try {
        stm.position = 0;
        stm.type = 1;

        if (/^UTF-8|Unicode$/i.test(charset)) { // BOMが重複しているなら既存のBOMをスキップ
            bin = new Binary(stm.read(6)); // stm.Position -> 6
            bin.getArray();
            if (bin[3] == 0xEF && bin[4] == 0xBB && bin[5] == 0xBF) // UTF-8
                setEOS(3, stm.Read(-1));
            else if (bin[2] == 0xFF && bin[3] == 0xFE || bin[2] == 0xFE && bin[3] == 0xFF) { // UTF-16LE & UTF-16BE
                stm.Position = 4;
                setEOS(2, stm.Read(-1));
            }
        }
        else { // 設定した文字コードには不要であるBOMが付いているなら削除
            bin = new Binary(stm.read(3)); // stm.Position -> 3
            bin.getArray();
            if (bin[0] == 0xEF && bin[1] == 0xBB && bin[2] == 0xBF) // UTF-8
                setEOS(0, stm.Read(-1));
            else if (bin[0] == 0xFF && bin[1] == 0xFE || bin[0] == 0xFE && bin[1] == 0xFF) { // UTF-16LE & UTF-16BE
                stm.Position = 2;
                setEOS(0, stm.Read(-1));
            }
        }

        if (UTF8N) { // UTF-8Nの保存に対応
            stm.Position = 3;
            setEOS(0, stm.Read(-1));
        }

        stm.position = 0;
        stm.saveToFile(file, 2);
    } catch (e) {
        throw new Error("Couldn't save text to a file.");
    } finally {
        stm.close();
        stm = null;
    }

    return file;
}

// バイナリモードでstreamへ流して_autodetect_allでテキスト取得した際に、BOMが文字として取り込まれるバグがある
// そのようにADODB.Streamを扱う場合は、Unicode体系において_autodetect_allを回避する必要がある
function readTextFile(file, charset) {
    var str;
    var stm = new ActiveXObject('ADODB.Stream');
    stm.type = 2;
    stm.charset = arguments.callee.lastCharset = charset || GetCharsetFromCodepage(utils.FileTest(file, "chardet"));
    stm.open();
    try {
        stm.loadFromFile(file); // stm.position -> 0
        str = stm.readText(-1); // _autodetect_allでの一行ごとの取得はまともに動かない
    } catch (e) {
        throw new Error("Couldn't open a file.\nIt has most likely been moved, renamed, or deleted.");
    } finally {
        stm.close();
        stm = null;
    }

    return str;
}

function responseBodyToCharset(bin, charset) { // Mozilla: overrideMimeType, IE: convert by ADODB.Stream (from Binary to UTF-8)
    var str;
    var stm = new ActiveXObject("ADODB.Stream");
    try {
        stm.open();
        stm.type = 1; // write once in binary mode
        stm.write(bin); // stm.position -> eos
        stm.position = 0;
        stm.type = 2; // change the mode to text mode
        stm.charset = charset;
        str = stm.readText(-1);
    } finally {
        stm.close();
    }

    return str;
}

function responseBodyToFile(bin, file) {
    var str;
    var stm = new ActiveXObject("ADODB.Stream");
    try {
        stm.open();
        stm.type = 1; // write once in binary mode
        stm.write(bin); // stm.position -> eos
        stm.position = 0;
        stm.saveToFile(file, 2);
    } finally {
        stm.close();
    }

    return file;
}

function getHTML(data, method, file, async, depth, onLoaded) {
    var request = new ActiveXObject("Msxml2.XMLHTTP");

    request.open(method, file, async);

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            try { onLoaded(request, depth, file); }
            catch (e) {
                fb.ShowPopupMessage('Error: onLoaded function crashed in getHTML\n\n' + file.match(/^https?:\/\/.+?\//) + '\n\n' + e.description);
            }
        }
    }

    request.setRequestHeader("Cache-Control", "max-age=0");
    request.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    request.send(data);
}

//-- Metadb --
function writeTagField(text, field, MetadbHandle) {
    var a = new ActiveXObject("Scripting.FileSystemObject").getFile(MetadbHandle.Path).Attributes;
    if (a & 1) // 1 means ReadOnly
        throw new Error("The file is read-only");
    MetadbHandle.UpdateFileInfoSimple(field, text);
}

//-- Clipboad --
function setClipboard(text) {
    new ActiveXObject("htmlfile").parentWindow.clipboardData.setData("text", text);
}

function getClipboard() {
    return new ActiveXObject("htmlfile").parentWindow.clipboardData.getData("text");
}

//-- Send to recycle bin --
function sendToRecycleBin(path) {
    var sa = new ActiveXObject("Shell.Application");
    var recycle_bin_folder = sa.Namespace(10);
    recycle_bin_folder.MoveHere(path);
}

//-- Shuffle for Array--
function shuffleArray(arr, from) { // arrの配列番号from以降をシャッフルする
    var i = arr.length;
    if (i - from < 2) return;
    while (i - from) {
        var j = Math.floor(Math.random() * (i - from)) + Number(from);
        var t = arr[--i];
        arr[i] = arr[j];
        arr[j] = t;
    }
    return arr;
};

//-- Line Feed Code --
function getLineFeedCode(str) {
    var CR_LF, CR, LF;

    CR_LF = /\r\n/.test(str);
    CR = /\r(?!\n)/.test(str);
    LF = /[^\r](?=\n)/.test(str);

    if (CR_LF)
        if (CR && LF) return /\r\n|\r|\n/;
        else if (CR) return /\r\n|\r/;
        else if (LF) return /\r\n|\n/;
        else return "\r\n";
    else
        if (CR && LF) return /\r|\n/;
        else if (CR) return "\r";
        else if (LF) return "\n";
        else return;
}

//-- Build Menu --
function buildMenu(items, parentMenu, flag, caption, radio) {
    if (arguments.length === 1) buildMenu.init();

    var _menu = window.CreatePopupMenu();
    var start_idx = buildMenu.idx;
    if (parentMenu)
        _menu.AppendTo(parentMenu, flag, caption);
    if (items instanceof Function) {
        items(_menu);
        return;
    }
    for (var i = 0; i < items.length; i++) {
        flag = (items[i].Flag instanceof Function) ? items[i].Flag() : items[i].Flag;
        caption = (items[i].Caption instanceof Function) ? items[i].Caption() : items[i].Caption;
        if (items[i].Sub) {
            arguments.callee(items[i].Sub, _menu, flag, caption, Number(items[i].Radio instanceof Function ? items[i].Radio() : items[i].Radio));
            continue;
        }
        _menu.AppendMenuItem(flag, buildMenu.idx, caption);
        buildMenu.item_list[buildMenu.idx++] = items[i];
    }

    isFinite(radio) && _menu.CheckMenuRadioItem(start_idx, buildMenu.idx - 1, start_idx + radio);
    return _menu;
}
buildMenu.init = function () {
    this.item_list = {};
    this.idx = 1;
};

//-- Get Charset From Codepage --
function GetCharsetFromCodepage(codepage) {
    switch (codepage) {
        case 37: return "IBM037"; // IBM EBCDIC (US - カナダ)
        case 437: return "IBM437"; // OEM アメリカ合衆国
        case 500: return "IBM500"; // IBM EBCDIC (インターナショナル)
        case 708: return "ASMO-708"; // アラビア語 (ASMO 708)
        case 720: return "DOS-720"; // アラビア語 (DOS)
        case 737: return "IBM737"; // ギリシャ語 (DOS)
        case 775: return "IBM775"; // バルト言語 (DOS)
        case 850: return "IBM850"; // 西ヨーロッパ言語 (DOS)
        case 852: return "IBM852"; // 中央ヨーロッパ言語 (DOS)
        case 855: return "IBM855"; // OEM キリル
        case 857: return "IBM857"; // トルコ語 (DOS)
        case 858: return "IBM00858"; // OEM マルチリンガル ラテン I
        case 860: return "IBM860"; // ポルトガル語  (DOS)
        case 861: return "IBM861"; // アイスランド語 (DOS)
        case 862: return "DOS-862"; // ヘブライ語 (DOS)
        case 863: return "IBM863"; // フランス語 (カナダ) (DOS)
        case 864: return "IBM864"; // アラビア語 (864)
        case 865: return "IBM865"; // 北欧 (DOS)
        case 866: return "CP866"; // キリル言語 (DOS)
        case 869: return "IBM869"; // ギリシャ語, Modern (DOS)
        case 870: return "IBM870"; // IBM EBCDIC (多国語ラテン 2)
        case 874: return "windows-874"; // タイ語 (Windows)
        case 875: return "CP875"; // IBM EBCDIC (ギリシャ語 Modern)
        case 932: return "Shift_JIS"; // 日本語 (シフト JIS)
        case 936: return "GBK"; // 簡体字中国語 (GB2312拡張)
        case 949: return "KS_C_5601-1987"; // 韓国語
        case 950: return "Big5"; // 繁体字中国語 (Big5)
        case 1026: return "IBM1026"; // IBM EBCDIC (トルコ語ラテン 5)
        case 1047: return "IBM01047"; // IBM ラテン-1
        case 1140: return "IBM01140"; // IBM EBCDIC (US - カナダ - ヨーロッパ)
        case 1141: return "IBM01141"; // IBM EBCDIC (ドイツ - ヨーロッパ)
        case 1142: return "IBM01142"; // IBM EBCDIC (デンマーク - ノルウェー - ヨーロッパ)
        case 1143: return "IBM01143"; // IBM EBCDIC (フィンランド - スウェーデン - ヨーロッパ)
        case 1144: return "IBM01144"; // IBM EBCDIC (イタリア - ヨーロッパ)
        case 1145: return "IBM01145"; // IBM EBCDIC (スペイン - ヨーロッパ)
        case 1146: return "IBM01146"; // IBM EBCDIC (UK - ヨーロッパ)
        case 1147: return "IBM01147"; // IBM EBCDIC (フランス - ヨーロッパ)
        case 1148: return "IBM01148"; // IBM EBCDIC (インターナショナル - ヨーロッパ)
        case 1149: return "IBM01149"; // IBM EBCDIC (アイスランド語 - ヨーロッパ)
        case 1200: return "UTF-16LE"; // Unicode (Little-Endian)
        case 1201: return "UTF-16BE"; // Unicode (Big-Endian)(UnicodeFFFE)
        case 1250: return "windows-1250"; // 中央ヨーロッパ言語 (Windows)
        case 1251: return "windows-1251"; // キリル言語 (Windows)
        case 1252: return "Windows-1252"; // 西ヨーロッパ言語 (Windows)
        case 1253: return "windows-1253"; // ギリシャ語 (Windows)
        case 1254: return "windows-1254"; // トルコ語 (Windows)
        case 1255: return "windows-1255"; // ヘブライ語 (Windows)
        case 1256: return "windows-1256"; // アラビア語 (Windows)
        case 1257: return "windows-1257"; // バルト言語 (Windows)
        case 1258: return "windows-1258"; // ベトナム語 (Windows)
        case 1361: return "Johab"; // 韓国語 (Johab)
        case 10000: return "macintosh"; // 西ヨーロッパ言語 (Mac)
        case 10001: return "x-mac-japanese"; // 日本語 (Mac)
        case 10002: return "x-mac-chinesetrad"; // 繁体字中国語 (Mac)
        case 10003: return "x-mac-korean"; // 韓国語 (Mac)
        case 10004: return "x-mac-arabic"; // アラビア語 (Mac)
        case 10005: return "x-mac-hebrew"; // ヘブライ語 (Mac)
        case 10006: return "x-mac-greek"; // ギリシャ語 (Mac)
        case 10007: return "x-mac-cyrillic"; // キリル言語 (Mac)
        case 10008: return "x-mac-chinesesimp"; // 簡体字中国語 (Mac)
        case 10010: return "x-mac-romanian"; // ルーマニア語 (Mac)
        case 10017: return "x-mac-ukrainian"; // ウクライナ語 (Mac)
        case 10021: return "x-mac-thai"; // タイ語 (Mac)
        case 10029: return "x-mac-ce"; // 中央ヨーロッパ言語 (Mac)
        case 10079: return "x-mac-icelandic"; // アイスランド語 (Mac)
        case 10081: return "x-mac-turkish"; // トルコ語 (Mac)
        case 10082: return "x-mac-croatian"; // クロアチア語 (Mac)
        case 12000: return "UTF-32"; // Unicode (UTF-32)
        case 12001: return "UTF-32BE"; // Unicode (UTF-32 ビッグ エンディアン)
        case 20000: return "x-Chinese-CNS"; // 繁体字中国語 (CNS)
        case 20001: return "x-cp20001"; // TCA 台湾
        case 20002: return "x-Chinese-Eten"; // 繁体字中国語 (Eten)
        case 20003: return "x-cp20003"; // IBM5550 台湾
        case 20004: return "x-cp20004"; // TeleText 台湾
        case 20005: return "x-cp20005"; // Wang 台湾 
        case 20105: return "x-IA5"; // 西ヨーロッパ言語 (IA5)
        case 20106: return "x-IA5-German"; // ドイツ語 (IA5)
        case 20107: return "x-IA5-Swedish"; // スウェーデン語 (IA5)
        case 20108: return "x-IA5-Norwegian"; // ノルウェー語 (IA5)
        case 20127: return "US-ASCII"; // US-ASCII
        case 20261: return "x-cp20261"; // T.61
        case 20269: return "x-cp20269"; // ISO-6937
        case 20273: return "IBM273"; // IBM EBCDIC (ドイツ)
        case 20277: return "IBM277"; // IBM EBCDIC (デンマーク - ノルウェー)
        case 20278: return "IBM278"; // IBM EBCDIC (フィンランド - スウェーデン)
        case 20280: return "IBM280"; // IBM EBCDIC (イタリア)
        case 20284: return "IBM284"; // IBM EBCDIC (スペイン)
        case 20285: return "IBM285"; // IBM EBCDIC (UK)
        case 20290: return "IBM290"; // IBM EBCDIC (日本語カタカナ)
        case 20297: return "IBM297"; // IBM EBCDIC (フランス)
        case 20420: return "IBM420"; // IBM EBCDIC (アラビア語)
        case 20423: return "IBM423"; // IBM EBCDIC (ギリシャ語)
        case 20424: return "IBM424"; // IBM EBCDIC (ヘブライ語)
        case 20833: return "x-EBCDIC-KoreanExtended"; // IBM EBCDIC (韓国語 Extended)
        case 20838: return "IBM-Thai"; // IBM EBCDIC (タイ語)
        case 20866: return "koi8-r"; // キリル言語 (KOI8-R)
        case 20871: return "IBM871"; // IBM EBCDIC (アイスランド語)
        case 20880: return "IBM880"; // IBM EBCDIC (キリル言語 - ロシア語)
        case 20905: return "IBM905"; // IBM EBCDIC (トルコ語)
        case 20924: return "IBM00924"; // IBM ラテン-1
        case 20932: return "EUC-JP"; // 日本語 (JIS 0208-1990 および 0212-1990)
        case 20936: return "x-cp20936"; // 簡体字中国語 (GB2312-80)
        case 20949: return "x-cp20949"; // 韓国語 Wansung
        case 21025: return "CP1025"; // IBM EBCDIC (キリル言語 セルビア - ブルガリア)
        case 21866: return "KOI8-U"; // キリル言語 (KOI8-U)
        case 28591: return "ISO-8859-1"; // 西ヨーロッパ言語 (ISO)
        case 28592: return "ISO-8859-2"; // 中央ヨーロッパ言語 (ISO)
        case 28593: return "ISO-8859-3"; // ラテン 3 (ISO)
        case 28594: return "ISO-8859-4"; // バルト言語 (ISO) 
        case 28595: return "ISO-8859-5"; // キリル言語 (ISO)
        case 28596: return "ISO-8859-6"; // アラビア語 (ISO)
        case 28597: return "ISO-8859-7"; // ギリシャ語 (ISO)
        case 28598: return "ISO-8859-8"; // ヘブライ語 (ISO-Visual)
        case 28599: return "ISO-8859-9"; // トルコ語 (ISO)
        case 28603: return "ISO-8859-13"; // エストニア語 (ISO)
        case 28605: return "ISO-8859-15"; // ラテン 9 (ISO)
        case 29001: return "x-Europa"; // ヨーロッパ
        case 38598: return "ISO-8859-8-i"; // ヘブライ語 (ISO-Logical)
        case 50220: return "ISO-2022-jp"; // 日本語 (JIS)
        case 50221: return "csISO2022JP"; // 日本語 (JIS 1 バイト カタカナ可)
        case 50222: return "ISO-2022-jp"; // 日本語 (JIS 1 バイト カタカナ可 - SO/SI)
        case 50225: return "ISO-2022-kr"; // 韓国語 (ISO)
        case 50227: return "x-cp50227"; // 簡体字中国語 (ISO-2022)
        case 51932: return "EUC-JP"; // 日本語 (EUC)
        case 51936: return "EUC-CN"; // 簡体字中国語 (EUC)
        case 51949: return "EUC-KR"; // 韓国語 (EUC)
        case 52936: return "HZ-GB-2312"; // 簡体字中国語 (HZ)
        case 54936: return "GB18030"; // 簡体字中国語 (GB18030)
        case 57002: return "x-iscii-de"; // ISCII デバナガリ文字
        case 57003: return "x-iscii-be"; // ISCII ベンガル語
        case 57004: return "x-iscii-ta"; // ISCII タミール語
        case 57005: return "x-iscii-te"; // ISCII テルグ語
        case 57006: return "x-iscii-as"; // ISCII アッサム語
        case 57007: return "x-iscii-or"; // ISCII オリヤー語
        case 57008: return "x-iscii-ka"; // ISCII カナラ語
        case 57009: return "x-iscii-ma"; // ISCII マラヤラム語
        case 57010: return "x-iscii-gu"; // ISCII グジャラート語
        case 57011: return "x-iscii-pa"; // ISCII パンジャブ語
        case 65000: return "UTF-7"; // Unicode (UTF-7)
        case 65001: return "UTF-8"; // Unicode (UTF-8)
        default: return "_autodetect_all";
    }
}


//-------------------------------------------------------------------
//
// Escape Codec Library: ecl.js (Ver.041208)
//
// Copyright (C) http://nurucom-archives.hp.infoseek.co.jp/digital/
//

EscapeSJIS = function (str) {
    return str.replace(/[^*+.-9A-Z_a-z-]/g, function (s) {
        var c = s.charCodeAt(0), m;
        return c < 128 ? (c < 16 ? "%0" : "%") + c.toString(16).toUpperCase() : 65376 < c && c < 65440 ? "%" + (c - 65216).toString(16).toUpperCase() : (c = JCT11280.indexOf(s)) < 0 ? "%81E" : "%" + ((m = ((c < 8272 ? c : (c = JCT11280.lastIndexOf(s))) - (c %= 188)) / 188) < 31 ? m + 129 : m + 193).toString(16).toUpperCase() + (64 < (c += c < 63 ? 64 : 65) && c < 91 || 95 == c || 96 < c && c < 123 ? String.fromCharCode(c) : "%" + c.toString(16).toUpperCase())
    })
};

UnescapeSJIS = function (str) {
    return str.replace(/%(8[1-9A-F]|[9E][0-9A-F]|F[0-9A-C])(%[4-689A-F][0-9A-F]|%7[0-9A-E]|[@-~])|%([0-7][0-9A-F]|A[1-9A-F]|[B-D][0-9A-F])/ig, function (s) {
        var c = parseInt(s.substring(1, 3), 16), l = s.length;
        return 3 == l ? String.fromCharCode(c < 160 ? c : c + 65216) : JCT11280.charAt((c < 160 ? c - 129 : c - 193) * 188 + (4 == l ? s.charCodeAt(3) - 64 : (c = parseInt(s.substring(4), 16)) < 127 ? c - 64 : c - 65))
    })
};

EscapeEUCJP = function (str) {
    return str.replace(/[^*+.-9A-Z_a-z-]/g, function (s) {
        var c = s.charCodeAt(0);
        return (c < 128 ? (c < 16 ? "%0" : "%") + c.toString(16) : 65376 < c && c < 65440 ? "%8E%" + (c - 65216).toString(16) : (c = JCT8836.indexOf(s)) < 0 ? "%A1%A6" : "%" + ((c - (c %= 94)) / 94 + 161).toString(16) + "%" + (c + 161).toString(16)).toUpperCase()
    })
};

UnescapeEUCJP = function (str) {
    return str.replace(/(%A[1-9A-F]|%[B-E][0-9A-F]|%F[0-9A-E]){2}|%8E%(A[1-9A-F]|[B-D][0-9A-F])|%[0-7][0-9A-F]/ig, function (s) {
        var c = parseInt(s.substring(1), 16);
        return c < 161 ? String.fromCharCode(c < 128 ? c : parseInt(s.substring(4), 16) + 65216) : JCT8836.charAt((c - 161) * 94 + parseInt(s.substring(4), 16) - 161)
    })
};

EscapeJIS7 = function (str) {
    var u = String.fromCharCode, ri = u(92, 120, 48, 48, 45, 92, 120, 55, 70), rj = u(65377, 45, 65439, 93, 43),
    H = function (c) {
        return 41 < c && c < 58 && 44 != c || 64 < c && c < 91 || 95 == c || 96 < c && c < 123 ? u(c) : "%" + c.toString(16).toUpperCase()
    },
    I = function (s) {
        var c = s.charCodeAt(0);
        return (c < 16 ? "%0" : "%") + c.toString(16).toUpperCase()
    },
    rI = new RegExp; rI.compile("[^*+.-9A-Z_a-z-]", "g");
    return ("g" + str + "g").replace(RegExp("[" + ri + "]+", "g"), function (s) {
        return "%1B%28B" + s.replace(rI, I)
    }).replace(RegExp("[" + rj, "g"), function (s) {
        var c, i = 0, t = "%1B%28I"; while (c = s.charCodeAt(i++)) t += H(c - 65344); return t
    }).replace(RegExp("[^" + ri + rj, "g"), function (s) {
        var a, c, i = 0, t = "%1B%24B"; while (a = s.charAt(i++)) t += (c = JCT8836.indexOf(a)) < 0 ? "%21%26" : H((c - (c %= 94)) / 94 + 33) + H(c + 33); return t
    }).slice(8, -1)
};

UnescapeJIS7 = function (str) {
    var i = 0, p, q, s = "", u = String.fromCharCode,
    P = ("%28B" + str.replace(/%49/g, "I").replace(/%1B%24%4[02]|%1B%24@/ig, "%1B%24B")).split(/%1B/i),
    I = function (s) {
        return u(parseInt(s.substring(1), 16))
    },
    J = function (s) {
        return u((3 == s.length ? parseInt(s.substring(1), 16) : s.charCodeAt(0)) + 65344)
    },
    K = function (s) {
        var l = s.length;
        return JCT8836.charAt(4 < l ? (parseInt(s.substring(1), 16) - 33) * 94 + parseInt(s.substring(4), 16) - 33 : 2 < l ? (37 == (l = s.charCodeAt(0)) ? (parseInt(s.substring(1, 3), 16) - 33) * 94 + s.charCodeAt(3) : (l - 33) * 94 + parseInt(s.substring(2), 16)) - 33 : (s.charCodeAt(0) - 33) * 94 + s.charCodeAt(1) - 33)
    },
    rI = new RegExp, rJ = new RegExp, rK = new RegExp;
    rI.compile("%[0-7][0-9A-F]", "ig"); rJ.compile("(%2[1-9A-F]|%[3-5][0-9A-F])|[!-_]", "ig");
    rK.compile("(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E]){2}|(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])[!-~]|[!-~](%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])|[!-~]{2}", "ig");
    while (p = P[i++]) s += "%24B" == (q = p.substring(0, 4)) ? p.substring(4).replace(rK, K) : "%28I" == q ? p.substring(4).replace(rJ, J) : p.replace(rI, I).substring(2);
    return s
};

EscapeJIS8 = function (str) {
    var u = String.fromCharCode, r = u(92, 120, 48, 48, 45, 92, 120, 55, 70, 65377, 45, 65439, 93, 43),
    H = function (c) {
        return 41 < c && c < 58 && 44 != c || 64 < c && c < 91 || 95 == c || 96 < c && c < 123 ? u(c) : "%" + c.toString(16).toUpperCase()
    },
    I = function (s) {
        var c = s.charCodeAt(0);
        return (c < 16 ? "%0" : "%") + (c < 128 ? c : c - 65216).toString(16).toUpperCase()
    },
    rI = new RegExp; rI.compile("[^*+.-9A-Z_a-z-]", "g");
    return ("g" + str + "g").replace(RegExp("[" + r, "g"), function (s) {
        return "%1B%28B" + s.replace(rI, I)
    }).replace(RegExp("[^" + r, "g"), function (s) {
        var a, c, i = 0, t = "%1B%24B"; while (a = s.charAt(i++)) t += (c = JCT8836.indexOf(a)) < 0 ? "%21%26" : H((c - (c %= 94)) / 94 + 33) + H(c + 33); return t
    }).slice(8, -1)
};

UnescapeJIS8 = function (str) {
    var i = 0, p, s = "",
    P = ("%28B" + str.replace(/%1B%24%4[02]|%1B%24@/ig, "%1B%24B")).split(/%1B/i),
    I = function (s) {
        var c = parseInt(s.substring(1), 16);
        return String.fromCharCode(c < 128 ? c : c + 65216)
    },
    K = function (s) {
        var l = s.length;
        return JCT8836.charAt(4 < l ? (parseInt(s.substring(1), 16) - 33) * 94 + parseInt(s.substring(4), 16) - 33 : 2 < l ? (37 == (l = s.charCodeAt(0)) ? (parseInt(s.substring(1, 3), 16) - 33) * 94 + s.charCodeAt(3) : (l - 33) * 94 + parseInt(s.substring(2), 16)) - 33 : (s.charCodeAt(0) - 33) * 94 + s.charCodeAt(1) - 33)
    },
    rI = new RegExp, rK = new RegExp;
    rI.compile("%([0-7][0-9A-F]|A[1-9A-F]|[B-D][0-9A-F])", "ig");
    rK.compile("(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E]){2}|(%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])[!-~]|[!-~](%2[1-9A-F]|%[3-6][0-9A-F]|%7[0-9A-E])|[!-~]{2}", "ig");
    while (p = P[i++]) s += "%24B" == p.substring(0, 4) ? p.substring(4).replace(rK, K) : p.replace(rI, I).substring(2);
    return s
};

EscapeUnicode = function (str) {
    return str.replace(/[^*+.-9A-Z_a-z-]/g, function (s) {
        var c = s.charCodeAt(0);
        return (c < 16 ? "%0" : c < 256 ? "%" : c < 4096 ? "%u0" : "%u") + c.toString(16).toUpperCase()
    })
};

UnescapeUnicode = function (str) {
    return str.replace(/%u[0-9A-F]{4}|%[0-9A-F]{2}/ig, function (s) {
        return String.fromCharCode("0x" + s.substring(s.length / 3))
    })
};

EscapeUTF7 = function (str) {
    var B = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
    E = function (s) {
        var c = s.charCodeAt(0);
        return B[c >> 10] + B[c >> 4 & 63] + B[(c & 15) << 2 | (c = s.charCodeAt(1)) >> 14] + (0 <= c ? B[c >> 8 & 63] + B[c >> 2 & 63] + B[(c & 3) << 4 | (c = s.charCodeAt(2)) >> 12] + (0 <= c ? B[c >> 6 & 63] + B[c & 63] : "") : "")
    },
    re = new RegExp; re.compile("[^+]{1,3}", "g");
    return (str + "g").replace(/[^*+.-9A-Z_a-z-]+[*+.-9A-Z_a-z-]|[+]/g, function (s) {
        if ("+" == s) return "+-";
        var l = s.length - 1, w = s.charAt(l);
        return "+" + s.substring(0, l).replace(re, E) + ("+" == w ? "-+-" : "*" == w || "." == w || "_" == w ? w : "-" + w)
    }).slice(0, -1)
};

UnescapeUTF7 = function (str) {
    var i = 0, B = {};
    while (i < 64) B["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i)] = i++;
    return str.replace(RegExp("[+][+/-9A-Za-z]*-?", "g"), function (s) {
        if ("+-" == s) return "+";
        var b = B[s.charAt(1)], c, i = 1, t = "";
        while (0 <= b) {
            if ((c = i & 7) < 6) c = c < 3 ? b << 10 | B[s.charAt(++i)] << 4 | (b = B[s.charAt(++i)]) >> 2 : (b & 3) << 14 | B[s.charAt(++i)] << 8 | B[s.charAt(++i)] << 2 | (b = B[s.charAt(++i)]) >> 4;
            else { c = (b & 15) << 12 | B[s.charAt(++i)] << 6 | B[s.charAt(++i)]; b = B[s.charAt(++i)] }
            if (c) t += String.fromCharCode(c)
        }
        return t
    })
};

EscapeUTF8 = function (str) {
    return str.replace(/[^*+.-9A-Z_a-z-]/g, function (s) {
        var c = s.charCodeAt(0);
        return (c < 16 ? "%0" + c.toString(16) : c < 128 ? "%" + c.toString(16) : c < 2048 ? "%" + (c >> 6 | 192).toString(16) + "%" + (c & 63 | 128).toString(16) : "%" + (c >> 12 | 224).toString(16) + "%" + (c >> 6 & 63 | 128).toString(16) + "%" + (c & 63 | 128).toString(16)).toUpperCase()
    })
};

UnescapeUTF8 = function (str) {
    return str.replace(/%(E(0%[AB]|[1-CEF]%[89AB]|D%[89])[0-9A-F]|C[2-9A-F]|D[0-9A-F])%[89AB][0-9A-F]|%[0-7][0-9A-F]/ig, function (s) {
        var c = parseInt(s.substring(1), 16);
        return String.fromCharCode(c < 128 ? c : c < 224 ? (c & 31) << 6 | parseInt(s.substring(4), 16) & 63 : ((c & 15) << 6 | parseInt(s.substring(4), 16) & 63) << 6 | parseInt(s.substring(7), 16) & 63)
    })
};

EscapeUTF16LE = function (str) {
    var H = function (c) {
        return 41 < c && c < 58 && 44 != c || 64 < c && c < 91 || 95 == c || 96 < c && c < 123 ? String.fromCharCode(c) : (c < 16 ? "%0" : "%") + c.toString(16).toUpperCase()
    };
    return str.replace(/[^ ]| /g, function (s) {
        var c = s.charCodeAt(0); return H(c & 255) + H(c >> 8)
    })
};

UnescapeUTF16LE = function (str) {
    var u = String.fromCharCode, b = u(92, 120, 48, 48, 45, 92, 120, 70, 70);
    return str.replace(/^%FF%FE/i, "").replace(RegExp("%[0-9A-F]{2}%[0-9A-F]{2}|%[0-9A-F]{2}[" + b + "]|[" + b + "]%[0-9A-F]{2}|[" + b + "]{2}", "ig"), function (s) {
        var l = s.length;
        return u(4 < l ? "0x" + s.substring(4, 6) + s.substring(1, 3) : 2 < l ? 37 == (l = s.charCodeAt(0)) ? parseInt(s.substring(1, 3), 16) | s.charCodeAt(3) << 8 : l | parseInt(s.substring(2), 16) << 8 : s.charCodeAt(0) | s.charCodeAt(1) << 8)
    })
};

GetEscapeCodeType = function (str) {
    if (/%u[0-9A-F]{4}/i.test(str)) return "Unicode";
    if (/%([0-9A-DF][0-9A-F]%[8A]0%|E0%80|[0-7][0-9A-F]|C[01])%[8A]0|%00|%[7F]F/i.test(str)) return "UTF16LE";
    if (/%E[0-9A-F]%[8A]0%[8A]0|%[CD][0-9A-F]%[8A]0/i.test(str)) return "UTF8";
    if (/%F[DE]/i.test(str)) return /%8[0-9A-D]|%9[0-9A-F]|%A0/i.test(str) ? "UTF16LE" : "EUCJP";
    if (/%1B/i.test(str)) return /%[A-D][0-9A-F]/i.test(str) ? "JIS8" : "JIS7";
    var S = str.substring(0, 6143).replace(/%[0-9A-F]{2}|[^ ]| /ig, function (s) {
        return s.length < 3 ? "40" : s.substring(1)
    }), c, C, i = 0, T;
    while (0 <= (c = parseInt(S.substring(i, i += 2), 16)) && i < 4092) if (128 <= c) {
        if ((C = parseInt(S.substring(i, i + 2), 16)) < 128) i += 2;
        else if (194 <= c && c < 240 && C < 192) {
            if (c < 224) { T = "UTF8"; i += 2; continue }
            if (2 == parseInt(S.charAt(i + 2), 16) >> 2) { T = "UTF8"; i += 4; continue }
        }
        if (142 == c && 161 <= C && C < 224) { if (!T) T = "EUCJP"; if ("EUCJP" == T) continue }
        if (c < 161) return "SJIS";
        if (c < 224 && !T)
            if ((164 == c && C < 244 || 165 == c && C < 247) && 161 <= C) i += 2;
            else T = 224 <= C ? "EUCJP" : "SJIS";
        else T = "EUCJP"
    }
    return T ? T : "EUCJP"
};

JCT11280 = Function('var a="zKV33~jZ4zN=~ji36XazM93y!{~k2y!o~k0ZlW6zN?3Wz3W?{EKzK[33[`y|;-~j^YOTz$!~kNy|L1$353~jV3zKk3~k-4P4zK_2+~jY4y!xYHR~jlz$_~jk4z$e3X5He<0y!wy|X3[:~l|VU[F3VZ056Hy!nz/m1XD61+1XY1E1=1y|bzKiz!H034zKj~mEz#c5ZA3-3X$1~mBz$$3~lyz#,4YN5~mEz#{ZKZ3V%7Y}!J3X-YEX_J(3~mAz =V;kE0/y|F3y!}~m>z/U~mI~j_2+~mA~jp2;~m@~k32;~m>V}2u~mEX#2x~mBy+x2242(~mBy,;2242(~may->2&XkG2;~mIy-_2&NXd2;~mGz,{4<6:.:B*B:XC4>6:.>B*BBXSA+A:X]E&E<~r#z+625z s2+zN=`HXI@YMXIAXZYUM8X4K/:Q!Z&33 3YWX[~mB`{zKt4z (zV/z 3zRw2%Wd39]S11z$PAXH5Xb;ZQWU1ZgWP%3~o@{Dgl#gd}T){Uo{y5_d{e@}C(} WU9|cB{w}bzvV|)[} H|zT}d||0~{]Q|(l{|x{iv{dw}(5}[Z|kuZ }cq{{y|ij}.I{idbof%cu^d}Rj^y|-M{ESYGYfYsZslS`?ZdYO__gLYRZ&fvb4oKfhSf^d<Yeasc1f&a=hnYG{QY{D`Bsa|u,}Dl|_Q{C%xK|Aq}C>|c#ryW=}eY{L+`)][YF_Ub^h4}[X|?r|u_ex}TL@YR]j{SrXgo*|Gv|rK}B#mu{R1}hs|dP{C7|^Qt3|@P{YVV |8&}#D}ef{e/{Rl|>Hni}R1{Z#{D[}CQlQ||E}[s{SG_+i8eplY[=[|ec[$YXn#`hcm}YR|{Ci(_[ql|?8p3]-}^t{wy}4la&pc|3e{Rp{LqiJ],] `kc(]@chYnrM`O^,ZLYhZB]ywyfGY~aex!_Qww{a!|)*lHrM{N+n&YYj~Z b c#e_[hZSon|rOt`}hBXa^i{lh|<0||r{KJ{kni)|x,|0auY{D!^Sce{w;|@S|cA}Xn{C1h${E]Z-XgZ*XPbp]^_qbH^e[`YM|a||+=]!Lc}]vdBc=j-YSZD]YmyYLYKZ9Z>Xcczc2{Yh}9Fc#Z.l{}(D{G{{mRhC|L3b#|xK[Bepj#ut`H[,{E9Yr}1b{[e]{ZFk7[ZYbZ0XL]}Ye[(`d}c!|*y`Dg=b;gR]Hm=hJho}R-[n}9;{N![7k_{UbmN]rf#pTe[x8}!Qcs_rs[m`|>N}^V})7{^r|/E}),}HH{OYe2{Skx)e<_.cj.cjoMhc^d}0uYZd!^J_@g,[[[?{i@][|3S}Yl3|!1|eZ|5IYw|1D}e7|Cv{OHbnx-`wvb[6[4} =g+k:{C:}ed{S]|2M]-}WZ|/q{LF|dYu^}Gs^c{Z=}h>|/i|{W]:|ip{N:|zt|S<{DH[p_tvD{N<[8Axo{X4a.^o^X>Yfa59`#ZBYgY~_t^9`jZHZn`>G[oajZ;X,i)Z.^~YJe ZiZF^{][[#Zt^|]Fjx]&_5dddW]P0C[-]}]d|y {C_jUql] |OpaA[Z{lp|rz}:Mu#]_Yf6{Ep?f5`$[6^D][^u[$[6^.Z8]]ePc2U/=]K^_+^M{q*|9tYuZ,s(dS{i=|bNbB{uG}0jZOa:[-]dYtu3]:]<{DJ_SZIqr_`l=Yt`gkTnXb3d@kiq0a`Z{|!B|}e}Ww{Sp,^Z|0>_Z}36|]A|-t}lt{R6pi|v8hPu#{C>YOZHYmg/Z4nicK[}hF_Bg|YRZ7c|crkzYZY}_iXcZ.|)U|L5{R~qi^Uga@Y[xb}&qdbd6h5|Btw[}c<{Ds53[Y7]?Z<|e0{L[ZK]mXKZ#Z2^tavf0`PE[OSOaP`4gi`qjdYMgys/?[nc,}EEb,eL]g[n{E_b/vcvgb.{kcwi`~v%|0:|iK{Jh_vf5lb}KL|(oi=LrzhhY_^@`zgf[~g)[J_0fk_V{T)}I_{D&_/d9W/|MU[)f$xW}?$xr4<{Lb{y4}&u{XJ|cm{Iu{jQ}CMkD{CX|7A}G~{kt)nB|d5|<-}WJ}@||d@|Iy}Ts|iL|/^|no|0;}L6{Pm]7}$zf:|r2}?C_k{R(}-w|`G{Gy[g]bVje=_0|PT{^Y^yjtT[[[l!Ye_`ZN]@[n_)j3nEgMa]YtYpZy].d-Y_cjb~Y~[nc~sCi3|zg}B0}do{O^{|$`_|D{}U&|0+{J3|8*]iayx{a{xJ_9|,c{Ee]QXlYb]$[%YMc*]w[aafe]aVYi[fZEii[xq2YQZHg]Y~h#|Y:thre^@^|_F^CbTbG_1^qf7{L-`VFx Zr|@EZ;gkZ@slgko`[e}T:{Cu^pddZ_`yav^Ea+[#ZBbSbO`elQfLui}.F|txYcbQ`XehcGe~fc^RlV{D_0ZAej[l&jShxG[ipB_=u:eU}3e8[=j|{D(}dO{Do[BYUZ0/]AYE]ALYhZcYlYP/^-^{Yt_1_-;YT`P4BZG=IOZ&]H[e]YYd[9^F[1YdZxZ?Z{Z<]Ba2[5Yb[0Z4l?]d_;_)a?YGEYiYv`_XmZs4ZjY^Zb]6gqGaX^9Y}dXZr[g|]Y}K aFZp^k^F]M`^{O1Ys]ZCgCv4|E>}8eb7}l`{L5[Z_faQ|c2}Fj}hw^#|Ng|B||w2|Sh{v+[G}aB|MY}A{|8o}X~{E8paZ:]i^Njq]new)`-Z>haounWhN}c#{DfZ|fK]KqGZ=:u|fqoqcv}2ssm}.r{]{nIfV{JW)[K|,Z{Uxc|]l_KdCb%]cfobya3`p}G^|LZiSC]U|(X|kBlVg[kNo({O:g:|-N|qT}9?{MBiL}Sq{`P|3a|u.{Uaq:{_o|^S}jX{Fob0`;|#y_@[V[K|cw[<_ }KU|0F}d3|et{Q7{LuZttsmf^kYZ`Af`}$x}U`|Ww}d]| >}K,r&|XI|*e{C/a-bmr1fId4[;b>tQ_:]hk{b-pMge]gfpo.|(w[jgV{EC1Z,YhaY^q,_G[c_g[J0YX]`[h^hYK^_Yib,` {i6vf@YM^hdOKZZn(jgZ>bzSDc^Z%[[o9[2=/YHZ(_/Gu_`*|8z{DUZxYt^vuvZjhi^lc&gUd4|<UiA`z]$b/Z?l}YI^jaHxe|;F}l${sQ}5g}hA|e4}?o{ih}Uz{C)jPe4]H^J[Eg[|AMZMlc}:,{iz}#*|gc{Iq|/:|zK{l&}#u|myd{{M&v~nV};L|(g|I]ogddb0xsd7^V})$uQ{HzazsgxtsO^l}F>ZB]r|{7{j@cU^{{CbiYoHlng]f+nQ[bkTn/}<-d9q {KXadZYo+n|l[|lc}V2{[a{S4Zam~Za^`{HH{xx_SvF|ak=c^[v^7_rYT`ld@]:_ub%[$[m](Shu}G2{E.ZU_L_R{tz`vj(f?^}hswz}GdZ}{S:h`aD|?W|`dgG|if{a8|J1{N,}-Ao3{H#{mfsP|[ bzn+}_Q{MT{u4kHcj_q`eZj[8o0jy{p7}C|[}l){MuYY{|Ff!Ykn3{rT|m,^R|,R}$~Ykgx{P!]>iXh6[l[/}Jgcg{JYZ.^qYfYIZl[gZ#Xj[Pc7YyZD^+Yt;4;`e8YyZVbQ7YzZxXja.7SYl[s]2^/Ha$[6ZGYrb%XiYdf2]H]kZkZ*ZQ[ZYS^HZXcCc%Z|[(bVZ]]:OJQ_DZCg<[,]%Zaa [g{C00HY[c%[ChyZ,Z_`PbXa+eh`^&jPi0a[ggvhlekL]w{Yp^v}[e{~;k%a&k^|nR_z_Qng}[E}*Wq:{k^{FJZpXRhmh3^p>de^=_7`|ZbaAZtdhZ?n4ZL]u`9ZNc3g%[6b=e.ZVfC[ZZ^^^hD{E(9c(kyZ=bb|Sq{k`|vmr>izlH[u|e`}49}Y%}FT{[z{Rk}Bz{TCc/lMiAqkf(m$hDc;qooi[}^o:c^|Qm}a_{mrZ(pA`,}<2sY| adf_%|}`}Y5U;}/4|D>|$X{jw{C<|F.hK|*A{MRZ8Zsm?imZm_?brYWZrYx`yVZc3a@f?aK^ojEd {bN}/3ZH]/$YZhm^&j 9|(S|b]mF}UI{q&aM]LcrZ5^.|[j`T_V_Gak}9J[ ZCZD|^h{N9{~&[6Zd{}B}2O|cv]K}3s}Uy|l,fihW{EG`j_QOp~Z$F^zexS`dcISfhZBXP|.vn|_HYQ|)9|cr]<`&Z6]m_(ZhPcSg>`Z]5`~1`0Xcb4k1{O!bz|CN_T{LR|a/gFcD|j<{Z._[f)mPc:1`WtIaT1cgYkZOaVZOYFrEe[}T$}Ch}mk{K-^@]fH{Hdi`c*Z&|Kt{if[C{Q;{xYB`dYIX:ZB[}]*[{{p9|4GYRh2ao{DS|V+[zd$`F[ZXKadb*A] Ys]Maif~a/Z2bmclb8{Jro_rz|x9cHojbZ{GzZx_)]:{wAayeDlx}<=`g{H1{l#}9i|)=|lP{Qq}.({La|!Y{i2EZfp=c*}Cc{EDvVB|;g}2t{W4av^Bn=]ri,|y?|3+}T*ckZ*{Ffr5e%|sB{lx^0]eZb]9[SgAjS_D|uHZx]dive[c.YPkcq/}db{EQh&hQ|eg}G!ljil|BO]X{Qr_GkGl~YiYWu=c3eb}29v3|D|}4i||.{Mv})V{SP1{FX}CZW6{cm|vO{pS|e#}A~|1i}81|Mw}es|5[}3w{C`h9aL]o{}p[G`>i%a1Z@`Ln2bD[$_h`}ZOjhdTrH{[j_:k~kv[Sdu]CtL}41{I |[[{]Zp$]XjxjHt_eThoa#h>sSt8|gK|TVi[Y{t=}Bs|b7Zpr%{gt|Yo{CS[/{iteva|cf^hgn}($_c^wmb^Wm+|55jrbF|{9^ q6{C&c+ZKdJkq_xOYqZYSYXYl`8]-cxZAq/b%b*_Vsa[/Ybjac/OaGZ4fza|a)gY{P?| I|Y |,pi1n7}9bm9ad|=d{aV|2@[(}B`d&|Uz}B}{`q|/H|!JkM{FU|CB|.{}Az}#P|lk}K{|2rk7{^8^?`/|k>|Ka{Sq}Gz}io{DxZh[yK_#}9<{TRdgc]`~Z>JYmYJ]|`!ZKZ]gUcx|^E[rZCd`f9oQ[NcD_$ZlZ;Zr}mX|=!|$6ZPZYtIo%fj}CpcN|B,{VDw~gb}@hZg`Q{LcmA[(bo`<|@$|o1|Ss}9Z_}tC|G`{F/|9nd}i=}V-{L8aaeST]daRbujh^xlpq8|}zs4bj[S`J|]?G{P#{rD{]I`OlH{Hm]VYuSYUbRc*6[j`8]pZ[bt_/^Jc*[<Z?YE|Xb|?_Z^Vcas]h{t9|Uwd)_(=0^6Zb{Nc} E[qZAeX[a]P^|_J>e8`W^j_Y}R{{Jp__]Ee#e:iWb9q_wKbujrbR}CY`,{mJ}gz{Q^{t~N|? gSga`V_||:#mi}3t|/I`X{N*|ct|2g{km}gi|{={jC}F;|E}{ZZjYf*frmu}8Tdroi{T[|+~}HG{cJ}DM{Lp{Ctd&}$hi3|FZ| m}Kr|38}^c|m_|Tr{Qv|36}?Up>|;S{DV{k_as}BK{P}}9p|t`jR{sAm4{D=b4pWa[}Xi{EjwEkI}3S|E?u=X0{jf} S|NM|JC{qo^3cm]-|JUx/{Cj{s>{Crt[UXuv|D~|j|d{YXZR}Aq}0r}(_{pJfi_z}0b|-vi)Z mFe,{f4|q`b{}^Z{HM{rbeHZ|^x_o|XM|L%|uFXm}@C_{{Hhp%a7|0p[Xp+^K}9U{bP}: tT}B|}+$|b2|[^|~h{FAby[`{}xgygrt~h1[li`c4vz|,7p~b(|mviN}^pg[{N/|g3|^0c,gE|f%|7N{q[|tc|TKA{LU}I@|AZp(}G-sz{F |qZ{}F|f-}RGn6{Z]_5})B}UJ{FFb2]4ZI@v=k,]t_Dg5Bj]Z-]L]vrpdvdGlk|gF}G]|IW}Y0[G| /bo|Te^,_B}#n^^{QHYI[?hxg{[`]D^IYRYTb&kJ[cri[g_9]Ud~^_]<p@_e_XdNm-^/|5)|h_{J;{kacVopf!q;asqd}n)|.m|bf{QW|U)}b+{tL|w``N|to{t ZO|T]jF}CB|0Q{e5Zw|k |We}5:{HO{tPwf_uajjBfX}-V_C_{{r~gg|Ude;s+}KNXH}! `K}eW{Upwbk%ogaW}9EYN}YY|&v|SL{C3[5s.]Y]I]u{M6{pYZ`^,`ZbCYR[1mNg>rsk0Ym[jrE]RYiZTr*YJ{Ge|%-lf|y(`=[t}E6{k!|3)}Zk} ][G{E~cF{u3U.rJ|a9p#o#ZE|?|{sYc#vv{E=|LC}cu{N8`/`3`9rt[4|He{cq|iSYxY`}V |(Q|t4{C?]k_Vlvk)BZ^r<{CL}#h}R+[<|i=}X|{KAo]|W<`K{NW|Zx}#;|fe{IMr<|K~tJ_x}AyLZ?{GvbLnRgN}X&{H7|x~}Jm{]-| GpNu0}.ok>|c4{PYisrDZ|fwh9|hfo@{H~XSbO]Odv]%`N]b1Y]]|eIZ}_-ZA]aj,>eFn+j[aQ_+]h[J_m_g]%_wf.`%k1e#Z?{CvYu_B^|gk`Xfh^M3`afGZ-Z|[m{L}|k3cp[it ^>YUi~d>{T*}YJ{Q5{Jxa$hg|%4`}|LAgvb }G}{P=|<;Ux{_skR{cV|-*|s-{Mp|XP|$G|_J}c6cM{_=_D|*9^$ec{V;|4S{qO|w_|.7}d0|/D}e}|0G{Dq]Kdp{}dfDi>}B%{Gd|nl}lf{C-{y}|ANZr}#={T~|-(}c&{pI|ft{lsVP}){|@u}!W|bcmB{d?|iW|:dxj{PSkO|Hl]Li:}VYk@|2={fnWt{M3`cZ6|)}|Xj}BYa?vo{e4|L7|B7{L7|1W|lvYO}W8nJ|$Vih|{T{d*_1|:-n2dblk``fT{Ky|-%}m!|Xy|-a{Pz}[l{kFjz|iH}9N{WE{x,|jz}R {P|{D)c=nX|Kq|si}Ge{sh|[X{RF{t`|jsr*fYf,rK|/9}$}}Nf{y!1|<Std}4Wez{W${Fd_/^O[ooqaw_z[L`Nbv[;l7V[ii3_PeM}.h^viqYjZ*j1}+3{bt{DR[;UG}3Og,rS{JO{qw{d<_zbAh<R[1_r`iZTbv^^a}c{iEgQZ<exZFg.^Rb+`Uj{a+{z<[~r!]`[[|rZYR|?F|qppp]L|-d|}K}YZUM|=Y|ktm*}F]{D;g{uI|7kg^}%?Z%ca{N[_<q4xC]i|PqZC]n}.bDrnh0Wq{tr|OMn6tM|!6|T`{O`|>!]ji+]_bTeU}Tq|ds}n|{Gm{z,f)}&s{DPYJ`%{CGd5v4tvb*hUh~bf]z`jajiFqAii]bfy^U{Or|m+{I)cS|.9k:e3`^|xN}@Dnlis`B|Qo{`W|>||kA}Y}{ERYuYx`%[exd`]|OyiHtb}HofUYbFo![5|+]gD{NIZR|Go}.T{rh^4]S|C9_}xO^i`vfQ}C)bK{TL}cQ|79iu}9a];sj{P.o!f[Y]pM``Jda^Wc9ZarteBZClxtM{LW}l9|a.mU}KX}4@{I+f1}37|8u}9c|v${xGlz}jP{Dd1}e:}31}%3X$|22i<v+r@~mf{sN{C67G97855F4YL5}8f{DT|xy{sO{DXB334@55J1)4.G9A#JDYtXTYM4, YQD9;XbXm9SX]IB^4UN=Xn<5(;(F3YW@XkH-X_VM[DYM:5XP!T&Y`6|,^{IS-*D.H>:LXjYQ0I3XhAF:9:(==.F*3F1189K/7163D,:@|e2{LS36D4hq{Lw/84443@4.933:0307::6D7}&l{Mx657;89;,K5678H&93D(H<&<>0B90X^I;}Ag1{P%3A+>><975}[S{PZE453?4|T2{Q+5187;>447:81{C=hL6{Me^:=7ii{R=.=F<81;48?|h8}Uh{SE|,VxL{ST,7?9Y_5Xk3A#:$%YSYdXeKXOD8+TXh7(@>(YdXYHXl9J6X_5IXaL0N?3YK7Xh!1?XgYz9YEXhXaYPXhC3X`-YLY_XfVf[EGXZ5L8BXL9YHX]SYTXjLXdJ: YcXbQXg1PX]Yx4|Jr{Ys4.8YU+XIY`0N,<H%-H;:0@,74/:8546I=9177154870UC]d<C3HXl7ALYzXFXWP<<?E!88E5@03YYXJ?YJ@6YxX-YdXhYG|9o{`iXjY_>YVXe>AYFX[/(I@0841?):-B=14337:8=|14{c&93788|di{cW-0>0<097/A;N{FqYpugAFT%X/Yo3Yn,#=XlCYHYNX[Xk3YN:YRT4?)-YH%A5XlYF3C1=NWyY}>:74-C673<69545v {iT85YED=64=.F4..9878/D4378?48B3:7:7/1VX[f4{D,{l<5E75{dAbRB-8-@+;DBF/$ZfW8S<4YhXA.(5@*11YV8./S95C/0R-A4AXQYI7?68167B95HA1*<M3?1/@;/=54XbYP36}lc{qzSS38:19?,/39193574/66878Yw1X-87E6=;964X`T734:>86>1/=0;(I-1::7ALYGXhF+Xk[@W%TYbX7)KXdYEXi,H-XhYMRXfYK?XgXj.9HX_SX]YL1XmYJ>Y}WwIXiI-3-GXcYyXUYJ$X`Vs[7;XnYEZ;XF! 3;%8;PXX(N3Y[)Xi1YE&/ :;74YQ6X`33C;-(>Xm0(TYF/!YGXg8 9L5P01YPXO-5%C|qd{{/K/E6,=0144:361:955;6443@?B7*7:F89&F35YaX-CYf,XiFYRXE_e{}sF 0*7XRYPYfXa5YXXY8Xf8Y~XmA[9VjYj*#YMXIYOXk,HHX40YxYMXU8OXe;YFXLYuPXP?EB[QV0CXfY{:9XV[FWE0D6X^YVP*$4%OXiYQ(|xp|%c3{}V`1>Y`XH00:8/M6XhQ1:;3414|TE|&o@1*=81G8<3}6<|(f6>>>5-5:8;093B^3U*+*^*UT30XgYU&7*O1953)5@E78--F7YF*B&0:%P68W9Zn5974J9::3}Vk|-,C)=)1AJ4+<3YGXfY[XQXmT1M-XcYTYZXCYZXEYXXMYN,17>XIG*SaS|/eYJXbI?XdNZ+WRYP<F:R PXf;0Xg`$|1GX9YdXjLYxWX!ZIXGYaXNYm6X9YMX?9EXmZ&XZ#XQ>YeXRXfAY[4 ;0X!Zz0XdN$XhYL XIY^XGNXUYS/1YFXhYk.TXn4DXjB{jg|4DEX]:XcZMW=A.+QYL<LKXc[vV$+&PX*Z3XMYIXUQ:ZvW< YSXFZ,XBYeXMM)?Xa XiZ4/EXcP3%}&-|6~:1(-+YT$@XIYRBC<}&,|7aJ6}bp|8)K1|Xg|8C}[T|8Q.89;-964I38361<=/;883651467<7:>?1:.}le|:Z=39;1Y^)?:J=?XfLXbXi=Q0YVYOXaXiLXmJXO5?.SFXiCYW}-;|=u&D-X`N0X^,YzYRXO(QX_YW9`I|>hZ:N&X)DQXP@YH#XmNXi$YWX^=!G6YbYdX>XjY|XlX^XdYkX>YnXUXPYF)FXT[EVTMYmYJXmYSXmNXi#GXmT3X8HOX[ZiXN]IU2>8YdX1YbX<YfWuZ8XSXcZU%0;1XnXkZ_WTG,XZYX5YSX Yp 05G?XcYW(IXg6K/XlYP4XnI @XnO1W4Zp-9C@%QDYX+OYeX9>--YSXkD.YR%Q/Yo YUX].Xi<HYEZ2WdCE6YMXa7F)=,D>-@9/8@5=?7164;35387?N<618=6>7D+C50<6B03J0{Hj|N9$D,9I-,.KB3}m |NzE0::/81YqXjMXl7YG; [.W=Z0X4XQY]:MXiR,XgM?9$9>:?E;YE77VS[Y564760391?14941:0=:8B:;/1DXjFA-564=0B3XlH1+D85:0Q!B#:-6&N/:9<-R3/7Xn<*3J4.H:+334B.=>30H.;3833/76464665755:/83H6633:=;.>5645}&E|Y)?1/YG-,93&N3AE@5 <L1-G/8A0D858/30>8<549=@B8] V0[uVQYlXeD(P#ID&7T&7;Xi0;7T-$YE)E=1:E1GR):--0YI7=E<}n9|aT6783A>D7&4YG7=391W;Zx<5+>F#J39}o/|cc;6=A050EQXg8A1-}D-|d^5548083563695D?-.YOXd37I$@LYLWeYlX<Yd+YR A$;3-4YQ-9XmA0!9/XLY_YT(=5XdDI>YJ5XP1ZAW{9>X_6R(XhYO65&J%DA)C-!B:97#A9;@?F;&;(9=11/=657/H,<8}bz|j^5446>.L+&Y^8Xb6?(CYOXb*YF(8X`FYR(XPYVXmPQ%&DD(XmZXW??YOXZXfCYJ79,O)XnYF7K0!QXmXi4IYFRXS,6<%-:YO(+:-3Q!1E1:W,Zo}Am|n~;3580534*?3Zc4=9334361693:30C<6/717:<1/;>59&:4}6!|rS36=1?75<8}[B|s809983579I.A.>84758=108564741H*9E{L{|u%YQ<%6XfH.YUXe4YL@,>N}Tv|ve*G0X)Z;/)3@A74(4P&A1X:YVH97;,754*A66:1 D739E3553545558E4?-?K17/770843XAYf838A7K%N!YW4.$T19Z`WJ*0XdYJXTYOXNZ 1XaN1A+I&Xi.Xk3Z3GB&5%WhZ1+5#Y[X<4YMXhQYoQXVXbYQ8XSYUX4YXBXWDMG0WxZA[8V+Z8X;D],Va$%YeX?FXfX[XeYf<X:Z[WsYz8X_Y]%XmQ(!7BXIZFX]&YE3F$(1XgYgYE& +[+W!<YMYFXc;+PXCYI9YrWxGXY9DY[!GXiI7::)OC;*$.>N*HA@{C|}&k=:<TB83X`3YL+G4XiK]i}(fYK<=5$.FYE%4*5*H*6XkCYL=*6Xi6!Yi1KXR4YHXbC8Xj,B9ZbWx/XbYON#5B}Ue}+QKXnF1&YV5XmYQ0!*3IXBYb71?1B75XmF;0B976;H/RXU:YZX;BG-NXj;XjI>A#D3B636N;,*%<D:0;YRXY973H5)-4FXOYf0:0;/7759774;7;:/855:543L43<?6=E,.A4:C=L)%4YV!1(YE/4YF+ F3%;S;&JC:%/?YEXJ4GXf/YS-EXEYW,9;E}X$}547EXiK=51-?71C%?57;5>463553Zg90;6447?<>4:9.7538XgN{|!}9K/E&3-:D+YE1)YE/3;37/:05}n<}:UX8Yj4Yt864@JYK..G=.(A Q3%6K>3(P3#AYE$-6H/456*C=.XHY[#S.<780191;057C)=6HXj?955B:K1 E>-B/9,;5.!L?:0>/.@//:;7833YZ56<4:YE=/:7Z_WGC%3I6>XkC*&NA16X=Yz2$X:Y^&J48<99k8}CyB-61<18K946YO4{|N}E)YIB9K0L>4=46<1K0+R;6-=1883:478;4,S+3YJX`GJXh.Yp+Xm6MXcYpX(>7Yo,/:X=Z;Xi0YTYHXjYmXiXj;*;I-8S6N#XgY}.3XfYGO3C/$XjL$*NYX,1 6;YH&<XkK9C#I74.>}Hd`A748X[T450[n75<4439:18A107>|ET}Rf<1;14876/Yb983E<5.YNXd4149>,S=/4E/<306443G/06}0&}UkYSXFYF=44=-5095=88;63844,9E6644{PL}WA8:>)7+>763>>0/B3A545CCnT}Xm|dv}Xq1L/YNXk/H8;;.R63351YY747@15YE4J8;46;.38.>4A369.=-83,;Ye3?:3@YE.4-+N353;/;@(X[YYD>@/05-I*@.:551741Yf5>6A443<3535;.58/86=D4753442$635D1>0359NQ @73:3:>><Xn?;43C14 ?Y|X611YG1&<+,4<*,YLXl<1/AIXjF*N89A4Z576K1XbJ5YF.ZOWN.YGXO/YQ01:4G38Xl1;KI0YFXB=R<7;D/,/4>;$I,YGXm94@O35Yz66695385.>:6A#5}W7n^4336:4157597434433<3|XA}m`>=D>:4A.337370?-6Q96{`E|4A}C`|Qs{Mk|J+~r>|o,wHv>Vw}!c{H!|Gb|*Ca5}J||,U{t+{CN[!M65YXOY_*B,Y[Z9XaX[QYJYLXPYuZ%XcZ8LY[SYPYKZM<LMYG9OYqSQYM~[e{UJXmQYyZM_)>YjN1~[f3{aXFY|Yk:48YdH^NZ0|T){jVFYTZNFY^YTYN~[h{nPYMYn3I]`EYUYsYIZEYJ7Yw)YnXPQYH+Z.ZAZY]^Z1Y`YSZFZyGYHXLYG 8Yd#4~[i|+)YH9D?Y^F~Y7|-eYxZ^WHYdYfZQ~[j|3>~[k|3oYmYqY^XYYO=Z*4[]Z/OYLXhZ1YLZIXgYIHYEYK,<Y`YEXIGZI[3YOYcB4SZ!YHZ*&Y{Xi3~[l|JSY`Zz?Z,~[m|O=Yi>??XnYWXmYS617YVYIHZ(Z4[~L4/=~[n|Yu{P)|];YOHHZ}~[o33|a>~[r|aE]DH~[s|e$Zz~[t|kZFY~XhYXZB[`Y}~[u|{SZ&OYkYQYuZ2Zf8D~[v}% ~[w3},Q[X]+YGYeYPIS~[y}4aZ!YN^!6PZ*~[z}?E~[{3}CnZ=~[}}EdDZz/9A3(3S<,YR8.D=*XgYPYcXN3Z5 4)~[~}JW=$Yu.XX~] }KDX`PXdZ4XfYpTJLY[F5]X~[2Yp}U+DZJ::<446[m@~]#3}]1~]%}^LZwZQ5Z`/OT<Yh^ -~]&}jx[ ~m<z!%2+~ly4VY-~o>}p62yz!%2+Xf2+~ly4VY-zQ`z (=] 2z~o2",C={" ":0,"!":1},c=34,i=2,p,s=[],u=String.fromCharCode,t=u(12539);while(++c<127)C[u(c)]=c^39&&c^92?i++:0;i=0;while(0<=(c=C[a.charAt(i++)]))if(16==c)if((c=C[a.charAt(i++)])<87){if(86==c)c=1879;while(c--)s.push(u(++p))}else s.push(s.join("").substr(8272,360));else if(c<86)s.push(u(p+=c<51?c-16:(c-55)*92+C[a.charAt(i++)]));else if((c=((c-86)*92+C[a.charAt(i++)])*92+C[a.charAt(i++)])<49152)s.push(u(p=c<40960?c:c|57344));else{c&=511;while(c--)s.push(t);p=12539}return s.join("")')();

JCT8836 = JCT11280.substring(0, 8836);

//// END Escape Codec Library: ecl.js (Ver.041208)


//EOF