# BadERC20 Wrappers

The purpose of this repository is to store code and information about Wrapped implementations of BadERC20 tokens.
BadERC20 token are tokens on Ethereum that are not fully ERC20-compliant, either because of a bug or because they follow an ERC20 specification that is too old to be used safely.

## Use cases
One major use-case it to wrap tokens that don't return value after a `transferFrom` call. This is the case for more than 100 tokens on Ethereum. More info in [Lukas Cremer's post](https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca).
Those tokens cannot be safely used in some DeFi dApps such as Balancer or Uniswap V1.

The most famous example of such tokens is OMG Network Token ([OMG](https://etherscan.io/token/0xd26114cd6EE289AccF82350c8d8487fedB8A0C07)), a token with a Market Cap of more than 400 million USD equivalent. That is why this repository will start with this token.

