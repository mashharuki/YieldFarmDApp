/**
 * 手動でDAPPトークンを発行するためのスクリプトファイル
 */

const TokenFarm = artifacts.require(`TokenFarm`)

module.exports = async function(callback) {
      let tokenFarm = await TokenFarm.deployed()
      // issueTokensメソッドを呼び出す
      await tokenFarm.issueTokens()
      console.log('Tokens issued!')
      callback()
}