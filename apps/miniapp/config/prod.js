module.exports = {
  defineConstants: {
    'process.env.TARO_APP_API_BASE_URL': JSON.stringify(
      process.env.TARO_APP_API_BASE_URL ?? 'https://beta.example.com/api',
    ),
    'process.env.TARO_APP_MOCK_WECHAT_PAY': JSON.stringify(
      process.env.TARO_APP_MOCK_WECHAT_PAY ?? 'false',
    ),
  },
};
