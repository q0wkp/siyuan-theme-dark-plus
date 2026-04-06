/* 在 HTML 块中使用的小工具 */

/* 运行系统命令 */
window.theme.runcmd = function (commands) {
    try {
        if (window.confirm(commands) && require) {
            commands = `start powershell -c ${commands.replaceAll('\n', '; ')}pause`;
            require('child_process').exec(commands, null);
        }
    }
    catch (err) {
        console.warn(err);
    }
}

/**
 * HTML 块中的脚本获取当前 shadow-root 的 host
 * REF [思源笔记折腾记录 -html 块 - 链接卡片 - 链滴](https://ld246.com/article/1682099979843)
 * @params {HTMLElement} element: HTML 块中的 DOM 节点
 * @return {object}:
 *      {string} id: 当前 HTML 块 ID
 *      {HTMLElement} block: 当前 HTML 块
 *      {HTMLElement} shadowRoot: 当前 HTML 块 shadowRoot
 * @return {null} null 当前 HTML 块不存在
 */
window.theme.THIS = function (element) {
    try {
        if (element) {
            return null;
        }

        if (element.host) {
            element = element.host;
            if (element?.parentElement?.parentElement?.dataset.nodeId) {
                return {
                    id: element.parentElement.parentElement.dataset.nodeId,
                    block: element.parentElement.parentElement,
                    shadowRoot: element.shadowRoot,
                };
            }
        }

        return this(element.parentNode);
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * HTML 块中的脚本获取当前块
 * @params {string} customID 内部定义的 ID
 * @return {object}:
 *      {string} id: 当前 HTML 块 ID
 *      {HTMLElement} block: 当前 HTML 块
 *      {HTMLElement} shadowRoot: 当前 HTML 块 shadowRoot
 * @return {null}: 当前 HTML 块不存在
 */
window.theme.This = function (customID) {
    let protyle = document.querySelector(`protyle-html[data-content*="${customID}"]`);
    if (protyle) {
        let block = protyle.parentElement.parentElement;
        return {
            id: block.dataset.nodeId,
            block: block,
            shadowRoot: protyle.shadowRoot,
        };
    }
    else return null;
}

