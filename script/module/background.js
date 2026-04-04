/* 背景图片 */

import { config } from './config.js';
import { globalEventHandler } from './../utils/listener.js';
import {
    toolbarItemInit,
} from './../utils/ui.js';
import {
    shuffle,
    Iterator,
} from './../utils/misc.js';

/**
 * 判断是否为纯色值 | Check if a string is a CSS color value
 * 支持 #hex, rgb(), rgba(), hsl(), hsla()
 */
function isColor(value) {
    if (!value || typeof value !== 'string') return false;
    if (value.startsWith('#')) return true;
    if (/^(rgb|rgba|hsl|hsla)\s*\(/.test(value)) return true;
    return false;
}

/**
 * object 模式可能覆盖的 CSS 自定义属性
 * 切换背景时需要清除这些 inline style，让 CSS 默认的透明值生效
 */
const OVERRIDE_PROPERTIES = [
    '--custom-editor-background-color',
    '--custom-panel-background-color',
    '--custom-dialog-background-color',
];

/**
 * 清除 object 模式的 inline style 覆盖，恢复 CSS 默认值
 */
function clearOverrides() {
    const el = document.documentElement;
    for (const prop of OVERRIDE_PROPERTIES) {
        el.style.removeProperty(prop);
    }
    delete el.dataset.bgMode;
}

/**
 * 应用 hard-coded 的半透明默认值，确保图片背景能透出
 * 这些值独立于 dark.css / light.css，避免个性化配色阻挡背景图
 */
function applyTransparentDefaults() {
    const el = document.documentElement;
    const mode = window.theme.themeMode === 'light' ? 'light' : 'dark';
    const defaults = config.theme.background.defaults[mode];
    el.style.setProperty('--custom-editor-background-color', defaults.editor);
    el.style.setProperty('--custom-panel-background-color', defaults.panel);
    el.style.setProperty('--custom-dialog-background-color', defaults.dialog);
    el.dataset.bgMode = 'image';
}

/**
 * 应用 object 模式：只覆盖 entry 中显式指定的 key，其余保持 CSS 默认（半透明）
 * @param {object} entry - { background: string, panel?: string, editor?: string, dialog?: string }
 */
function applyObjectMode(entry) {
    const el = document.documentElement;
    const mode = window.theme.themeMode === 'light' ? 'light' : 'dark';
    const defaults = config.theme.background.defaults[mode];

    // 显式指定的 key 用指定值，省略的 key 回落到 hard-coded 半透明默认值
    el.style.setProperty('--custom-editor-background-color', entry.editor || defaults.editor);
    el.style.setProperty('--custom-panel-background-color', entry.panel || defaults.panel);
    el.style.setProperty('--custom-dialog-background-color', entry.dialog || defaults.dialog);

    el.dataset.bgMode = 'object';
}

/**
 * 预加载图片，返回 Promise | Preload an image and resolve when loaded
 */
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

/**
 * 判断值是否为图片 URL（非纯色、非 CSS 函数）
 */
function isImageURL(value) {
    return typeof value === 'string' && !isColor(value) && !value.includes('(');
}

/**
 * 更换背景
 * @param {null|string|object} entry
 *   - null: 恢复 CSS 默认
 *   - string: 图片路径或纯色字符串（CSS 默认的半透明叠加）
 *   - object { background, panel?, editor?, dialog? }: 设置背景，可选覆盖面板/编辑区/对话框颜色
 *     省略的 key 保持 CSS 默认（半透明叠加）
 */
function changeBackground(entry = null) {
    const prop = config.theme.background.image.propertyName;

    if (entry === null) {
        /* 恢复默认：清除所有 inline style 覆盖 */
        clearOverrides();
        document.documentElement.style.removeProperty(prop);
    } else if (typeof entry === 'object') {
        /* object 模式：按需覆盖 background/panel/editor，省略的 key 保持 CSS 默认 */
        const applyBg = (bgValue) => {
            if (bgValue) {
                if (isColor(bgValue)) {
                    document.documentElement.style.setProperty(prop, `linear-gradient(${bgValue}, ${bgValue})`);
                } else {
                    document.documentElement.style.setProperty(prop, bgValue);
                }
            }
            applyObjectMode(entry);
        };
        if (entry.background && isImageURL(entry.background)) {
            preloadImage(entry.background).then(() => applyBg(entry.background)).catch(console.error);
        } else {
            applyBg(entry.background);
        }
    } else if (typeof entry === 'string') {
        /* 字符串模式：应用 hard-coded 半透明默认值，确保图片背景能透出 */
        if (isColor(entry)) {
            applyTransparentDefaults();
            document.documentElement.style.setProperty(prop, `linear-gradient(${entry}, ${entry})`);
        } else {
            /* 先预加载图片，加载完成后再切换，避免白色闪烁 */
            preloadImage(entry).then(() => {
                applyTransparentDefaults();
                document.documentElement.style.setProperty(prop, `url("${entry}")`);
            }).catch(console.error);
        }
    }
}

function switchBackground(lightIter, darkIter) {
    // console.log(customBackground);
    let landscape, portrait;
    /* 判断主题颜色 */
    switch (window.theme.themeMode) {
        case 'light':
            landscape = lightIter.landscape;
            portrait = lightIter.portrait;
            break;
        case 'dark':
        default:
            landscape = darkIter.landscape;
            portrait = darkIter.portrait;
            break;
    }
    /* 判断窗口宽高 */
    switch (window.theme.orientation()) {
        case 'portrait':
            changeBackground(portrait.next().value);
            break;
        case 'landscape':
        default:
            changeBackground(landscape.next().value);
            break;
    }
}

setTimeout(() => {
    try {
        if (config.theme.background.enable) {
            if (config.theme.background.image.enable) {
                if (config.theme.background.image.web.enable) {
                    const WEB_LIGHT_LANDSCAPE_ITER = config.theme.background.image.web.random
                        ? Iterator(shuffle(config.theme.background.image.web.landscape.light.slice()), true)
                        : Iterator(config.theme.background.image.web.landscape.light.slice(), true);
                    const WEB_LIGHT_PORTRAIT_ITER = config.theme.background.image.web.random
                        ? Iterator(shuffle(config.theme.background.image.web.portrait.light.slice()), true)
                        : Iterator(config.theme.background.image.web.portrait.light.slice(), true);

                    const WEB_DARK_LANDSCAPE_ITER = config.theme.background.image.web.random
                        ? Iterator(shuffle(config.theme.background.image.web.landscape.dark.slice()), true)
                        : Iterator(config.theme.background.image.web.landscape.dark.slice(), true);
                    const WEB_DARK_PORTRAIT_ITER = config.theme.background.image.web.random
                        ? Iterator(shuffle(config.theme.background.image.web.portrait.dark.slice()), true)
                        : Iterator(config.theme.background.image.web.portrait.dark.slice(), true);

                    const Fn_webBackground = toolbarItemInit(
                        config.theme.background.image.web.toolbar,
                        () => switchBackground({
                            landscape: WEB_LIGHT_LANDSCAPE_ITER,
                            portrait: WEB_LIGHT_PORTRAIT_ITER,
                        }, {
                            landscape: WEB_DARK_LANDSCAPE_ITER,
                            portrait: WEB_DARK_PORTRAIT_ITER,
                        }),
                    );

                    // 随机背景图片
                    globalEventHandler.addEventHandler(
                        'keyup',
                        config.theme.hotkeys.background.image.web,
                        _ => Fn_webBackground(),
                    );
                }
                if (config.theme.background.image.custom.enable) {
                    const CUSTOM_LIGHT_LANDSCAPE_ITER = config.theme.background.image.custom.random
                        ? Iterator(shuffle(config.theme.background.image.custom.landscape.light.slice()), true)
                        : Iterator(config.theme.background.image.custom.landscape.light.slice(), true);
                    const CUSTOM_LIGHT_PORTRAIT_ITER = config.theme.background.image.custom.random
                        ? Iterator(shuffle(config.theme.background.image.custom.portrait.light.slice()), true)
                        : Iterator(config.theme.background.image.custom.portrait.light.slice(), true);

                    const CUSTOM_DARK_LANDSCAPE_ITER = config.theme.background.image.custom.random
                        ? Iterator(shuffle(config.theme.background.image.custom.landscape.dark.slice()), true)
                        : Iterator(config.theme.background.image.custom.landscape.dark.slice(), true);
                    const CUSTOM_DARK_PORTRAIT_ITER = config.theme.background.image.custom.random
                        ? Iterator(shuffle(config.theme.background.image.custom.portrait.dark.slice()), true)
                        : Iterator(config.theme.background.image.custom.portrait.dark.slice(), true);

                    const Fn_customBackground = toolbarItemInit(
                        config.theme.background.image.custom.toolbar,
                        () => switchBackground({
                            landscape: CUSTOM_LIGHT_LANDSCAPE_ITER,
                            portrait: CUSTOM_LIGHT_PORTRAIT_ITER,
                        }, {
                            landscape: CUSTOM_DARK_LANDSCAPE_ITER,
                            portrait: CUSTOM_DARK_PORTRAIT_ITER,
                        }),
                        2,
                    );
                    // 是否默认启用自定义背景图片
                    if (config.theme.background.image.custom.default) Fn_customBackground();

                    // 使用快捷键切换自定义背景图片
                    globalEventHandler.addEventHandler(
                        'keyup',
                        config.theme.hotkeys.background.image.custom,
                        _ => Fn_customBackground(),
                    );
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}, 0);
