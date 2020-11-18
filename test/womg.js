const { wrapperBehaviorTest, erc20BehaviorTest } = require('./wrapped-baderc20');

const baseTokenInfo = {
  symbol: 'OMG',
  artifact: artifacts.require('OMGToken'),
};

const wrappedTokenInfo = {
  symbol: 'WOMG',
  artifact: artifacts.require('WOMG'),
};

wrapperBehaviorTest(baseTokenInfo, wrappedTokenInfo);
erc20BehaviorTest(baseTokenInfo, wrappedTokenInfo);
