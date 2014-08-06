﻿dplugin_Utamap = {
    name: "dplugin_Utamap",
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: うたまっぷ' : 'Download Lyrics: Utamap',
    author: 'tomato111',
    onCommand: function () {

        ws = new ActiveXObject("WScript.Shell");
        if (!fb.IsPlaying) {
            ws.popup("Not Playing.");
            return;
        }

        //###### Properties ########
        var ShowInputDialog = true; //タイトル名、アーティスト名の入力ダイアログを表示するならtrue
        var AutoSave = false; //歌詞が見つかったと同時にファイルに保存するならtrue
        //##########################

        var debug_html = false; // for debug
        var sa = new ActiveXObject("Shell.Application");
        var async = true;
        var depth = 0;
        var info = false;
        var txt = true;
        var LineFeedCode = prop.Save.LineFeedCode;
        var searchRe = new RegExp('<TD class=(ct\\d{3})>(?:<A href="(.+?=(.+?))">)?(.*?)(?:</A>)?</td>', "i");
        var infoRe = new RegExp('<td class="pad5x10x0x10">(.*?)</td>', "i");

        // title, artist for search
        var title = fb.TitleFormat("%title%").Eval();
        var artist = fb.TitleFormat("%artist%").Eval();

        if (ShowInputDialog) {
            title = prompt("Please input TITLE", "Lyrics Downloader", title);
            if (!title) return;
            artist = prompt("Please input ARTIST", "Lyrics Downloader", artist);
            if (!artist) return;
        }

        StatusBar.setText("検索中......");
        StatusBar.show();
        getHTML(null, "GET", createQuery(title), async, depth, onLoaded);

        function createQuery(word, page, id) {
            if (id)
                return "http://www.utamap.com/phpflash/flashfalsephp.php?unum=" + id;
            else
                return "http://www.utamap.com/searchkasi.php?searchname=title&word=" + encodeURIComponent(word) + (page ? ("&page=" + page) : "") + "&act=search&sortname=1&pattern=4";
        }

        function onLoaded(request, depth) {
            StatusBar.setText("検索中......");
            StatusBar.show();
            debug_html && fb.trace("\nOpen#" + getHTML.PRESENT.depth + ": " + getHTML.PRESENT.file + "\n");
            if (depth === true) {
                var res = request.responseBody; // binary for without character corruption
                res = responseBodyToCharset(res, "UTF-8");
            }
            else
                res = request.responseText;

            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, "GET", Page.url, !async, info, onLoaded);
                getHTML(null, "GET", createQuery(false, true, Page.id), async, txt, onLoaded);
            }
            else if (!Page.searchResult)
                if (Page.Lyrics) {
                    var text = onLoaded.Info + Page.Lyrics;

                    debug_html && fb.trace("\n" + text + "\n===End debug=============");
                    main(text);
                    StatusBar.setText("検索終了。歌詞を取得しました。");
                    StatusBar.show();
                    if (AutoSave)
                        saveToFile(parse_path + (filetype === "lrc" ? ".lrc" : ".txt"));
                }
                else if (onLoaded.Info) { return; }
                else {
                    StatusBar.hide();
                    var intButton = ws.Popup("ページが見つかりませんでした。\nブラウザで開きますか？", 0, "確認", 36);
                    if (intButton == 6)
                        sa.ShellExecute('"' + getHTML.PRESENT.file.replace(/&page=\d+/, "") + '"', "", "", "open", 1);
                }
            else {
                getHTML(null, "GET", createQuery(title, ++depth), async, depth, onLoaded);
            }

        }

        function AnalyzePage(resArray, depth) {
            var id, url, tmpti, tmpar;
            this.searchResult = false;

            if (depth === false) { // info
                onLoaded.Info = title + LineFeedCode + LineFeedCode;
                for (var i = 0, j = 0; i < resArray.length; i++)
                    if (infoRe.test(resArray[i])) {
                        onLoaded.Info += RegExp.$1.replace(/&nbsp;/g, " ").replace(/<strong>|<\/strong>/gi, "") + (j++ % 2 ? LineFeedCode : "  ");
                    }
                onLoaded.Info += LineFeedCode;
            }
            else if (depth === true) { // lyric
                this.Lyrics = "";
                resArray[0] = resArray[0].replace(/^.+?&.+?=/, "");
                for (i = 0; i < resArray.length; i++) {
                    debug_html && fb.trace(i + ": " + resArray[i]);
                    this.Lyrics += resArray[i] + LineFeedCode;
                }
                this.Lyrics = this.Lyrics.trim();
            }
            else { // search
                tmpti = title;
                tmpar = artist;
                title = title.replace(/&/g, "&amp;");
                artist = artist.replace(/&/g, "&amp;");
                for (i = 0; i < resArray.length; i++)
                    if (searchRe.test(resArray[i])) {
                        debug_html && fb.trace("class: " + RegExp.$1 + ", id: " + RegExp.$3 + ", value: " + RegExp.$4);
                        if (RegExp.$1 == "ct160" && RegExp.$4 == title) {
                            id = RegExp.$3;
                            url = "http://www.utamap.com" + RegExp.$2.slice(1);
                            !this.searchResult && (this.searchResult = true);
                        }
                        else if (id && RegExp.$1 == "ct120" && RegExp.$4 == artist) {
                            this.id = id;
                            this.url = url;
                            break;
                        }
                        else {
                            id = null;
                        }
                    }
                title = tmpti;
                artist = tmpar;
            }

        }

    }

};
