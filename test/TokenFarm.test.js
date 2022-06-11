/**
 * TokenFormコントラクト用のテストコードです。
 */

const DappToken = artifacts.require(`DappToken`);
const DaiToken = artifacts.require(`DaiToken`);
const TokenFarm = artifacts.require(`TokenFarm`);

const { assert } = require('chai');
require(`chai`)
    .use(require('chai-as-promised'))
    .should()

/**
 * ETHをWeiに変換するメソッド
 */
function tokens(n) {
      return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
      // 各コントラクト用の変数
      let daiToken, dappToken, tokenFarm
  
      // テスト実施前の設定
      before(async () =>{
            // コントラクトオブジェクトを作成
            daiToken = await DaiToken.new()
            dappToken = await DappToken.new()
            tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
      
            // トークンファームに資産を送る。
            await dappToken.transfer(tokenFarm.address, tokens('1000000'));      
            await daiToken.transfer(investor, tokens('100'), {from: owner})
      })
  
      // DaiToken用のテストシナリオ
      describe('Mock DAI deployment', async () => {
          // トークンの名前が意図したものかチェックする。
          it('has a name', async () => {
              const name = await daiToken.name()
              assert.equal(name, 'Mock DAI Token')
          })
      })
  
      // DappToken用のテストシナリオ
      describe('Dapp Token deployment', async () => {
           // トークンの名前が意図したものかチェックする。
          it('has a name', async () => {
              const name = await dappToken.name()
              assert.equal(name, 'DApp Token')
          })
      })
  
      // TokenFarm用のテストシナリオ
      describe('Token Farm deployment', async () => {
           // トークンの名前が意図したものかチェックする。
          it('has a name', async () => {
              const name = await tokenFarm.name()
              assert.equal(name, "Dapp Token Farm")
          })
  
          // 保有しているトークン量が想定通りかチェックする。
          it('contract has tokens', async () => {
              let balance = await dappToken.balanceOf(tokenFarm.address)
              assert.equal(balance.toString(), tokens('1000000'))
          })
      })
})

