﻿##Installation
<http://ashiato1.blog62.fc2.com/blog-entry-64.html>
##History
--v1.4.7(2015/08/30)--------------------------------------------------

* プラグインの修正  

--v1.4.6(2015/08/29)--------------------------------------------------

* no lyrics 時にホイールクリックでプラグインメニューを表示するようにした  
* 再生の停止等をした時にメニューを閉じるようにした（誤動作防止）  

--v1.4.5(2015/08/01)--------------------------------------------------

* ScrollType の切り替えで生じる不具合を修正  
* パネル上部/下部でフェード表示できる設定を追加  
  Style.Fading, Style.FadingHeight  

--v1.4.4(2015/07/26)--------------------------------------------------

* 行頭の空白を表示するように修正  
* foo_uie_tabs のタブ切り替えで表示位置がズレる問題を修正  
* ホイールスクロールに関する設定を追加  
  Panel.MouseWheelDelta (移動量) と Panel.MouseWheelSmoothing  
* 再生行の着色に関する設定を追加  
  Style.FadeInPlayingColor  
* 1つのプラグイン追加とサイトの仕様変更に対応  

--v1.4.3(2015/03/29)--------------------------------------------------

* en.ini 内の誤字修正  
* foo_uie_tabs との組み合わせでハングアップする問題を修正  

--v1.4.2(2015/03/21)--------------------------------------------------

* 行頭以外のタイムタグを表示しないようにした  
* 不具合修正  

--v1.4.1(2015/03/14)--------------------------------------------------

* Style.DrawingMethod を廃止し代わりに  
　Style.EnableStyleTextRender を追加  
* ScrollType：4 でエラーを起こす場合がある不具合を修正  
* Ctrl+ホイール回転 でフォントサイズを変更できるようにした  
* スクロール方法とStyleTextRenderの切り替えに1～6キーを割り当て  

--v1.4.0(2015/03/07)--------------------------------------------------

* プラグインにファンクションキー（F1～F9）を順に割り当て  
* Panel.Keybind.LastUsedPlugin を廃止  
* 設定名変更 Panel.LRC.ScrollStartTime -> ScrollDurationTime  
* Panel.LRC.ScrollType：4 と 5 を追加 （GDI+用）  
* Style.User.LyricShow.TextRound を RGBA から RGB へ変更  

--v1.3.4(2015/02/25)--------------------------------------------------

* Panel.Interval および Panel.Interval2 を廃止  
* スクロールに関する設定を追加  
　Panel.LRC.ScrollStartTime（スクロール方法のタイプ2と3の動きに影響）  
　Panel.LRC.ScrollToCenter（Modokiでのシーク時に歌詞を中央へスクロール）  
* StyleTextRender(GDI+)での影サイズを指定できる設定を追加  
　Style.Text-RoundSize  
* 不具合修正  

--v1.3.3(2015/02/15)--------------------------------------------------

* インストール場所をプロファイルフォルダに変更（利便性の観点から）  
　※以前のファイルは削除し、インストールの項を参考に再インストールして下さい  
　※Panel.BackgroundPath は一度「Delete」して「Apply」後に再設定して下さい  
* プラグインに関する設定を追加  
　Plugin.Search.AutoSaveTo （空欄 or Tag or File を記述）  
　Plugin.CheckUpdateOnStartUp （更新があると右クリックメニューに通知される）  
* 「フォルダを開く」で場合によって保存先とは違うフォルダが開かれる不具合を修正  

--v1.3.2(2015/01/20)--------------------------------------------------

* パネルが非表示でも動作を継続する設定 Panel.RunInTheBackground  
　を追加 ("Click here ～"にならず処理が継続します)  
* パネルサイズが変化した際に表示を即時に修正するようにした  
* タグに保存する際のフィールド名をiTunesと同一にする設定 Save.iTunesMode  
　を追加  

--v1.3.1(2014/10/19)--------------------------------------------------

* 列揃えの設定/変更時に通常画面と編集画面の列揃えを同期するように修正  

--v1.3.0(2014/10/14)--------------------------------------------------

* DrawString(GDI+) や StyleTextRender(GDI+) による文字描画を実装  
　それに伴い Style.DrawingMethod を追加  
　また、右クリックメニューに切り替え用の項目を追加  
　※StyleTextRender(GDI+)はCPU負荷が大きくなるので注意  
* StyleTextRender(GDI+) を使用した際の文字周りの色を設定できる  
　Style.User.LyricShow.TextRound を追加  
* 誤差補正の程度を状況によって弱くするように修正  
* あいまい検索（Panel.Path.FuzzyLevel が1以上）で  
　ファイル名の大文字と小文字が区別される不具合を修正  

--v1.2.10(2014/10/04)--------------------------------------------------

* 先頭行or曲の先頭へシークするキーバインドと  
　曲名+アーティスト名をGoogle検索するキーバインドを追加  
　Panel.Keybind.SeekToTop （Default is 'E' key）  
　Panel.Keybind.GoogleSearch （Default is 'G' key）  
* 「開く...」に関するいくつかの不具合を修正  

--v1.2.9(2014/09/15)--------------------------------------------------

* 自動スクロールの有効/無効を設定として記憶するようにした  
　Panel.AutoScroll  
* Style.CenterPosition をパネルの高さに対する割合に変更. 0～100[%]  

--v1.2.8(2014/08/23)--------------------------------------------------

* 不具合修正  

--v1.2.7(2014/08/09)--------------------------------------------------

* 最後に使ったプラグインを呼び出すキーバインドと  
　設定を呼び出すキーバインドを追加  
  Panel.Keybind.LastUsedPlugin（Default is 'U' key）  
  Panel.Keybind.Properties（Default is 'P' key）  
* 更新チェックプラグインを追加  
* Style.HighlineColorをオン/オフできるメニューを追加  
* 他の WSH Panel Mod からstringデータを受け取れるようにした（再生中）  
　　他のWSHパネルで例えば以下を実行すると"hello world"を受け取って表示  
　　window.NotifyOthers("Lyric Show Modoki", "hello world");  

--v1.2.6(2014/08/07)--------------------------------------------------

* 同梱プラグインの修正  
* 非同期歌詞を保存する際に、先頭と末尾に改行が入らないように修正  
* 言語をiniファイルとして分離  

--v1.2.5(2014/07/25)--------------------------------------------------

* UNC形式のネットワークパスから歌詞ファイルを取得できない不具合を修正  

--v1.2.4(2014/06/21)--------------------------------------------------

* 保存完了時に音を鳴らすようにした  
* その他調整  

--v1.2.3(2014/05/22)--------------------------------------------------

* クリップボードから取得と同時に保存できる設定を追加  
　Save.GetClipbord.AutoSaveTo  
* 同期歌詞を表示していない状態でのダブルクリックに「更新」を割り当て  
* 保存完了ダイアログを廃止し、別の表示方法に変更  
* メニューからの色変更で生じる不具合を修正  
* タグに保存時の不具合を修正  

--v1.2.2(2014/04/18)--------------------------------------------------

* クリップボード周りの仕様を変更  
　- ダイアログを廃止し直にパネルへ読み込むように  
　- 内容がファイルパス(txtまたはlrc)ならそのファイルから取得  
　- Ctrl + V で「クリップボードから取得」  
　- Ctrl + C で「コピー」（タイムタグ付き）  
　- 「ファイルに保存」メニューを追加  

--v1.2.1(2014/04/15)--------------------------------------------------

* 特定のパネルサイズでカクつき易くなる不具合を修正  
* Panel.RefreshInterval2 を追加（ScrollType:2 or 3 の更新間隔）  

--v1.2.0(2014/04/12)--------------------------------------------------

* Panel.Keybind.Reload を追加（Default is 'R' key）  
* 歌詞の初期表示位置を調整できる Style.CenterPosition を追加  
* Panel.LRC.ScrollType：3 を追加  
* シーク時の表示不具合を修正  
* 誤差補正によるカクつきを抑えるように修正  

--v1.1.8(2014/03/29)--------------------------------------------------

* Style.Line-Padding に関する不具合を修正  

--v1.1.7(2014/03/11)--------------------------------------------------

* クリップボードから読み込んだ歌詞を直接タグにも保存できるようにした  
* サイトの仕様変更に対応：Lyrics Downloader (Miku Hatsune wiki) プラグイン  

--v1.1.6(2014/02/24)--------------------------------------------------

* クリックした歌詞へシークする機能において、Style.Vartical-Padding の  
　値分ずれた座標の歌詞がクリックされたことになる不具合を修正  
* Edit画面での Style.Vartical-Padding 周りの調整  

--v1.1.5(2014/02/22)--------------------------------------------------

* いくつかのコマンドを任意のキーバインドで実行できるようにした  
　Panel.Keybind.～  
* 自動スクロールの有無を曲変更後も記憶するようにした  
* Edit画面中の Down キーでエラーとなる場合がある不具合を修正  
* タイムタグの書式を[12:34.56]か[12:34:56]のどちらか選べるようにした  
　Save.Timetag[12:34:56]  

--v1.1.4(2013/09/17)--------------------------------------------------

* スクロールのスムーズさを調整できる設定 Panel.RefreshInterval を追加  
　値が小さいほど動きの速い場面でより滑らかになります（CPU負荷は微増）  
* 歌詞へのシークをシングルクリックで行えるようにする設定を追加  
　Panel.SingleClickSeek  
* 右クリックメニューからスクロールの停止/再開を行えるようにした  
* Edit.Step が機能しない不具合の修正&初期値の変更（10→15）  

--v1.1.3(2013/08/09)--------------------------------------------------

* 画像サイズの計算でエラーを起こす場合がある不具合を修正（typo）  

--v1.1.2(2013/06/09)--------------------------------------------------

* 列揃え Center-Right, Right-Center の表示ズレを修正(+lib.js更新)  
* パネルのダブルクリックでエラーを起こす場合がある不具合を修正  
* 自動スクロールに関する修正  

--v1.1.1(2013/06/01)--------------------------------------------------

* Panel.Path.FuzzyLevel の 1 or 2 の動作における不具合の修正と高速化  
* 折り返し表示の不具合を修正  
* 列揃え Left-Center, Right-Center の仕様を若干変更  

--v1.1.0(2013/05/31)--------------------------------------------------

* 列揃えに Center-Left, Center-Right, Right-Center を追加  
* 折り返しを見やすくなるように修正  
* メニューからカラースタイルを変更できるようにした  
* 歌詞ファイルの検索に曖昧さを追加  
　Panel.Path.FuzzyLevel  

--v1.0.16(2013/05/26)--------------------------------------------------

* 文字に影を付けられるようにした. 右クリックメニューから切り替え可  
　Style.Shadow, Style.ShadowPosition,  
　Style.User.LyricShow.TextShadow  
* イタリック体の切り替えを追加. 右クリックメニューから切り替え可  
　Style.Font-Italic  

--v1.0.15(2013/05/22)--------------------------------------------------

* Edit画面での↑,↓キー動作を安定化  
* 同期歌詞を手動で最後までスクロールした時に再描画されない不具合を修正  
* 歌詞を(ダブル)クリックできる範囲がずれていた不具合を修正  
* ダブルクリックした歌詞へシークした際に表示位置が変わらないように変更  
* 3行以上の折り返し表示に対応  

--v1.0.14(2013/05/17)--------------------------------------------------

* 手動で最後までスクロールした時に発生するスクロールの不具合を修正  
* その他スクロールに関する修正  

--v1.0.13(2013/05/15)--------------------------------------------------

* 非同期歌詞のスクロールの安定化  
　それに伴い、曲選択時にあえて歌詞読み込みを遅くしていたのを廃止  

--v1.0.12(2013/05/01)--------------------------------------------------

* 背景画像ファイルの指定にワイルドカードを使用できるようにした  
　(ファイル名にのみ使用できます/最初にマッチした1枚を表示)  

--v1.0.11(2013/02/14)--------------------------------------------------

* 同期歌詞のスクロール方法を変更するオプションを追加. 右クリックから変更可  
　Panel.LRC.ScrollType (1:今までと同様のスクロール, 2:新しく追加したスクロール)  
* 文字描画に関する処理を修正  
* 歌詞の表示位置を若干上方へ修正  

--v1.0.10(2012/09/28)--------------------------------------------------

* 非同期歌詞のスクロールスピードをパーセンテージで調整できるようにした  
　Panel.AdjustScrolling 曲の終わりにスクロールし終わる速度を100[%]とする  
* 特定の再生開始方法で表示がカクつく問題を回避  

--v1.0.9(2012/08/27)--------------------------------------------------

* LYRICSタグに非同期歌詞が入っていても注意ダイアログが出ないように修正  
* 列揃え(Align)にLeft-Centerを追加  
* Edit画面中の列揃えの変更を通常表示の方へ反映しないようにした  

--v1.0.8(2012/08/03)--------------------------------------------------

* Line-Paddingのプロパティ値訂正の不具合を修正  
* 歌詞に表記される"繰り返し"等を展開出来るようにした(非同期歌詞)  
　repeat.txt にパターンを記述。ない場合はrepeat-default.txtが適用される  

--v1.0.7(2012/07/27)--------------------------------------------------

* 「この歌詞について」に適用したオフセット値を表示するようにした  
* 1つの歌詞検索プラグインを削除  

--v1.0.6(2012/07/17)--------------------------------------------------

* 不具合修正  

--v1.0.5(2012/05/16)--------------------------------------------------

* 設定の Panel.RefreshInterval を廃止(30msに固定)  

--v1.0.4(2012/05/07)--------------------------------------------------

* 不具合修正  

--v1.0.3(2012/05/02)--------------------------------------------------

* 画像の表示/非表示の不具合を修正  
* クリップボードからファイルを作成出来るようにした  

--v1.0.2(2012/04/28)--------------------------------------------------

* 自動スクロール量に誤差が生じる不具合を修正  
* 最終行を表示中に更新するとダブルクリックによるシークが出来ない不具合を修正  
* 表示の安定化により曲変更から5秒後の再読み込みを廃止  
* 右クリックメニューに背景画像の表示/非表示を追加  
* Panel.RefreshIntervalの初期値を50→30に変更  
* Panel.Background.EnableとStyle.HighlineColorの初期値を変更  

--v1.0.1(2012/04/26)--------------------------------------------------

* タグから読み込んだ歌詞がドラッグ移動できない不具合を修正  
* その他細かい修正  

--v1.0.0(2012/04/26)--------------------------------------------------

* CPU負荷を軽減  
* 表示の安定性を上げるため、曲変更から5秒後に再読み込みするようにした  
* -no lyrics-時にドラッグ移動できないように修正  
* Panel.RefreshInterval の下限を10→30に変更  
* 背景画像を設定できるようにした(Title Formatting使用可)  
　それに伴い Panel.Background.Enable  
　　　　　　 Panel.Background.Image  
　　　　　　 Panel.Background.ImageOption  
　　　　　　 Panel.Background.ImageToRawBitmap  
　　　　　　 Panel.Background.KeepAspectRatio  
　　　　　　 panel.Background.Stretch を追加  

--v0.9.12(2012/04/07)--------------------------------------------------

* Panel.Pathでフォルダ名にTFを用いた時に保存できない不具合を修正  
* タグからファイルに保存する際に保存先が正しく取得できない不具合を修正  

--v0.9.11(2012/04/06)--------------------------------------------------

* パネルの端に背景色が適用されない隙間ができる不具合を修正  
* Panel.Pathに複数のパスを登録できるようにした("||"で区切る)  
　登録パスから歌詞を読み込んでいない状態での「ファイルに保存」は  
　先頭のパスが保存先になります。  

--v0.9.10(2012/03/24)--------------------------------------------------

* カラースタイルのプロパティ値チェックの不具合を修正  
* 一つの歌詞検索プラグインの不具合を修正  

--v0.9.9(2012/02/27)---------------------------------------------------

* メニューのTXTファイル削除でLRCが削除対象になる不具合を修正  
* パネルが非表示の時には読み込みに行かないようにした  

--v0.9.8(2012/02/24)---------------------------------------------------

* 拡張子とファイルの内容が一致しない場合の通知方法を変更  
* 読み込み可能な文字コードを大幅に追加  

--v0.9.7(2012/02/22)---------------------------------------------------

* Shift_JIS, EUC-JPの一部文字化けを解消  
* ファイル読み込みに使われたCharsetを歌詞の詳細に表示するようにした  
* 行をファイル末尾へ追加できるようにした  
* 1つの歌詞検索プラグインを追加  

--v0.9.6(2012/02/20)---------------------------------------------------

* オフセットアイコンとダイアログ操作ファイルの追加  
　これらの入れ忘れのため使えない状態でした。機能は0.9.5と変わりません。  

--v0.9.5(2012/02/18)---------------------------------------------------

* 同一のタイムタグが存在する場合に後のものだけ取得される不具合を修正  
* 微調整を連続で行った時の動作を安定化  
* ファイル削除はゴミ箱へ移動するように変更  
* ファイルを指定して開けるようにした(コンテキストメニュー)  

--v0.9.4(2012/02/16)---------------------------------------------------

* UTF-8での一部文字化けを解消  
* 50ms単位の調整時にエラーになる不具合を修正  
* ビューモード時にRGBのステップ値計算が行われていなかった不具合を修正  
* ステップ値が正しく働くように内部でRGBAの扱いを修正  
* Line-Paddingで行数表示の位置がずれる不具合を修正  
* Line-Padding時の文字表示位置を調整(編集画面)  
* NoLyricテキストの表示にLine-Paddingが効くように変更  
* 一括で時間調整出来るようにした(オフセット調整)+アイコン追加  
　　Shift + ↑ or ↓でも変更できます  

--v0.9.3(2012/02/14)---------------------------------------------------

* 編集画面でのメニューの不具合を修正  
* 最終行を削除時の不具合を修正  
* 非同期歌詞を保存・コピーする際に不要な空白行が挿入される不具合を修正  
* 保存を押すタイミングによってエラーが発生することがあった不具合を修正  
* タグに保存時のエラー処理を追加  
* 保存先にタグかファイルを選べるようにした  
* LRCファイル内のタイムタグのない行を認識できるようにした  
　　認識しない場合はこれまで通りそれらの行は保存対象になりません  
* 改行コードが混在しているファイルを正常に読めるようにした  
* UTF-8,UTF-16LE,UTF-16BEのBOMが正常に処理できていなかった不具合を修正  
* 保存時の文字コードに"UTF-8N"を追加  
* 歌詞検索プラグインを一つ追加  

--v0.9.2(2012/02/11)---------------------------------------------------

* 歌詞を(ダブル)クリックした際にシーク出来ないことがあったバグを修正  
* 保存時の不具合を修正  
* 右下のアイコンに再読み込みを割り当て  

--v0.9.1(2012/02/06)---------------------------------------------------

* プロパティ値チェックの不具合を修正  
* 他のWSHパネルからの更新指示を受け取れるようにした  
* 行間を調整できるようにした(Style.Line-Padding)  
* RunAfterSaveに複数のコマンドを登録できるようにした（"||"で区切る）  
* RunAfterSaveで他のWSHパネルに指示を送れるようにした  
　e.g.) View/Lyrics Show 2/Refresh||&lt;Assist LRC Creation&gt;  
* 非同期歌詞のテキストをハイラインカラーに出来るようにした  
　(Style.HighlineColor for unsynced lyric)  
* プラグイン機能もどきの追加  
* 歌詞検索:初音ミクwiki のプラグインを追加  
* Lyrics Downloader(Miku Hatsune wiki)へ検索指示を出すプラグインを追加  