/**
 * TokenFormコントラクト用のテストコードです。
 */

const DappToken = artifacts.require(`DappToken`);
const DaiToken = artifacts.require(`DaiToken`);
const TokenFarm = artifacts.require(`TokenFarm`);

const { assert } = require('chai');
require(`chai`).use(require('chai-as-promised')).should()

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

      // ステーキング機能用のテストシナリオ
      describe('Farming tokens', async () => {
            it('rewords investors for staking mDai tokens', async () => {
                let result
                // 投資家の残高を確認する。
                result = await daiToken.balanceOf(investor)
                assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
    
                // TokenFarmmコントラクトに100トークン送金する権限をapproveする。
                await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
                // ステーキング実行
                await tokenFarm.stakeTokens(tokens('100'), {from: investor})
    
                // 残高が想定した通りになっていることを確認する。
                result = await daiToken.balanceOf(investor)
                assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')
                result = await daiToken.balanceOf(tokenFarm.address)
                assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')
    
                // ステーキングした結果を取得する。
                result = await tokenFarm.stakingBalance(investor)
                assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')
                // ステーキングしたことになっていること。
                result = await tokenFarm.isStaking(investor)
                assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
            })
      })
})

