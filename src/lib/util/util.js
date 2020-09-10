export function compareJSON(json1, json2) {
    return (JSON.stringify(json1) === JSON.stringify(json2))
}

function fallbackCopyTextToClipboard(text, cb) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        cb({ success: true });
    } catch (error) {
        cb({ error });
    }

    document.body.removeChild(textArea);
}

export function copyTextToClipboard(text, cb) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
    } else {
        navigator.clipboard.writeText(text).then(function () {
            cb({ success: true });
        }, function () {
            cb({ error: true });
        });
    }

}
export function isPC() { //是否为PC端
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
export function randomString(length, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
export function getStatusBarHeight() {
    return navigator.userAgent.indexOf('YingApp') > -1 ? 20 : 0
}