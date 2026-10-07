#!/bin/zsh
# Local end-to-end rig on an anvil fork of Robinhood Chain (anvil on :8545).
# Server wallet = anvil account 0. Funds it with NVDA, deploys the factory, launches a test $ASK.
set -e
F=~/.foundry/bin
RPC=http://127.0.0.1:8545
# Anvil default account 0 (public test key, fork only).
KEY=${ANVIL_KEY:-$(~/.foundry/bin/cast wallet private-key "test test test test test test test test test test test junk" 0)}
ME=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NVDA=0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC
PM=0x8366a39CC670B4001A1121B8F6A443A643e40951
LAUNCHPAD=0xD57759Fc069FF9f8901042E3df8f13708c0d9E6F

$F/cast rpc anvil_setBalance $PM 0x56BC75E2D63100000 -r $RPC >/dev/null
$F/cast rpc anvil_impersonateAccount $PM -r $RPC >/dev/null
$F/cast send $NVDA "transfer(address,uint256)" $ME 3ether --from $PM --unlocked -r $RPC >/dev/null
$F/cast rpc anvil_stopImpersonatingAccount $PM -r $RPC >/dev/null

cd ~/justask
FACTORY=$($F/forge create contracts/SplitterFactory.sol:SplitterFactory --broadcast -r $RPC --private-key $KEY \
  --constructor-args $LAUNCHPAD $ME $ME 2>/dev/null | awk '/Deployed to/{print $3}')

$F/cast send $NVDA "approve(address,uint256)" $LAUNCHPAD 1ether --private-key $KEY -r $RPC >/dev/null
ASK=$($F/cast call $LAUNCHPAD "create(string,string,string,address,uint24,uint24,uint256)(address,bytes32)" \
  "Just Ask" ASK "" $NVDA 20000 150000 10000000000000000 --from $ME -r $RPC | head -1)
$F/cast send $LAUNCHPAD "create(string,string,string,address,uint24,uint24,uint256)" \
  "Just Ask" ASK "" $NVDA 20000 150000 10000000000000000 --private-key $KEY -r $RPC >/dev/null

echo "SPLITTER_FACTORY=$FACTORY"
echo "ASK_TOKEN=$ASK"
echo "DEPLOYER_KEY=$KEY"
