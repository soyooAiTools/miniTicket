import { defineConfig } from '@tarojs/cli';

const sharedConfig = {
  compiler: 'webpack5',
  designWidth: 750,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  framework: 'react',
  outputRoot: 'dist',
  plugins: [],
  projectName: 'miniapp',
  sourceRoot: 'src',
};

export default defineConfig((merge, { mode }) => {
  const envConfig =
    mode === 'development' || process.env.NODE_ENV === 'development'
      ? require('./dev')
      : require('./prod');

  return merge({}, sharedConfig, envConfig);
});
