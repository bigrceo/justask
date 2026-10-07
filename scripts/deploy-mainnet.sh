#!/bin/zsh
# Deploys SplitterFactory on Robinhood Chain from the server wallet (.secrets) and wires it into Vercel.
set -e
cd ~/justask && source .secrets
F=~/.foundry/bin; RPC=https://rpc.mainnet.chain.robinhood.com
BAL=$($F/cast balance $SERVER_ADDRESS -r $RPC)
[ "$BAL" = "0" ] && { echo "Server wallet $SERVER_ADDRESS has no ETH yet."; exit 1; }
OUT=$($F/forge create contracts/SplitterFactory.sol:SplitterFactory --broadcast -r $RPC --private-key $DEPLOYER_KEY \
  --constructor-args 0xD57759Fc069FF9f8901042E3df8f13708c0d9E6F $SERVER_ADDRESS $SERVER_ADDRESS)
FACTORY=$(echo "$OUT" | awk '/Deployed to/{print $3}')
echo "SplitterFactory: $FACTORY"
echo "SPLITTER_FACTORY=$FACTORY" >> .secrets
printf %s "$FACTORY" | npx -y vercel@latest env add SPLITTER_FACTORY production
npx -y vercel@latest deploy --prod --yes >/dev/null && echo "Redeployed."
