const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require(`DappToken`);
const DaiToken = artifacts.require(`DaiToken`);

module.exports = async function(deployer, newtwork, accounts) {
  // DAIトークンコントラクトをデプロイ
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();
  // DappTokenコントラクトをデプロイ
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();
  // TokenFarmコントラクトをデプロイする。
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed()
  //トークンファームコントラクトに対して100万Dapp発行
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');
  //アカウント2に対して100Dai発行
  await daiToken.transfer(accounts[1], '100000000000000000000');
};