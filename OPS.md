# Just Ask — mise en prod

## 1. Wallet serveur (une seule clé)
Il lance les coins (operator), reçoit la part burn (protocol) et rachète $ASK. Il lui faut de l'ETH (gas) et du NVDA
(premier achat obligatoire chez Karat : FIRST_BUY_NVDA par launch, 0.005 par défaut).

## 2. Déployer la factory sur la mainnet
    forge create contracts/SplitterFactory.sol:SplitterFactory --broadcast \
      -r https://rpc.mainnet.chain.robinhood.com --private-key $DEPLOYER_KEY \
      --constructor-args 0xD57759Fc069FF9f8901042E3df8f13708c0d9E6F $SERVER_WALLET $SERVER_WALLET

## 3. Variables Vercel (projet justask)
DEPLOYER_KEY, SPLITTER_FACTORY, ASK_TOKEN (CA de $ASK, vide = « posted at launch »), RESERVE_NVDA (gardé pour les launches),
FIRST_BUY_NVDA, LAUNCHES_PER_DAY, NEXT_PUBLIC_DOMAIN, NEXT_PUBLIC_X_HANDLE. Déjà posées : DATABASE_URL, CRON_SECRET.

## 4. $ASK
Le lancer sur Karat paire NVDA (le buyback suppose un pool $ASK/NVDA), puis poser ASK_TOKEN.

## Burn toutes les 10 min
Plan Hobby = cron quotidien seulement : le cycle est relancé par les visites (/api/stats, au plus une fois par 10 min).
Pour un vrai 10 min : un cron externe sur GET /api/cron/burn avec `Authorization: Bearer $CRON_SECRET`.

## Test local de bout en bout
anvil fork sur :8545, `npx pglite-server --port 5544`, `scripts/fork-setup.sh`, .env.local (voir fork-setup), `npm run dev`.
