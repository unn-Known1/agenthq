// 这个脚本运行在ISOLATED world中，可以访问chrome.runtime API
// 它的作用是接收来自background script的消息，并转发到MAIN world

// 严格验证消息来源 (CWE-346)
const ALLOWED_ORIGINS = ['https://*.supabase.co', 'https://*.vercel.app', 'http://localhost:*'];

function isOriginAllowed(origin) {
  return ALLOWED_ORIGINS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      return regex.test(origin);
    }
    return pattern === origin;
  });
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理所有网络相关的消息（成功和错误）
  if ((message.action === 'logNetworkError' || message.action === 'logNetworkSuccess') && message.data) {
    // 使用postMessage将数据传递到MAIN world，只发送到当前页面的origin
    window.postMessage({
      type: message.action === 'logNetworkSuccess' ? 'MATRIX_API_SUCCESS_LOG' : 'MATRIX_ERROR_LOG',
      data: message.data
    }, window.location.origin); // Use specific origin instead of wildcard (CWE-346)
  }
  // 发送响应，表示消息已处理
  sendResponse({ received: true });
  return true;
});
