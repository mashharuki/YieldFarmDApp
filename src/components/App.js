import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

// StyledPaperコンポーネント
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 600,
  backgroundColor: '#fde9e8'
}));

/**
 * Appコンポーネント
 */
class App extends Component {

  /**
   * レンダリング前に実行するメソッド
   */
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  /**
   * コンストラクター
   */
  constructor(props) {
    super(props);
    // ステートを定義する。
    this.state = {
      account: '0x0',
      owner: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  /**
   * ウォレットの所有状況を確認するためのメソッド
   */
  async loadWeb3() {
    if (window.etheruem) {
      window.web3 = new Web3(window.etheruem)
      await window.etheruem.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }

    else {
      window.alert('Non etheruem browser detected. You should consider trying to install metamask')
    }

    this.setState({ loading: false})
  }

  /**
   * コントラクトの情報を取得するためのメソッド
   */
  async loadBlockchainData() {
    const web3 = window.web3
    // アカウント情報取得
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    // ネットワークIDを取得
    const networkId = await web3.eth.net.getId()
    // DaiToken のデータを取得
    const daiTokenData = DaiToken.networks[networkId]
    // アドレスが取得できた場合は下記を実行
    if(daiTokenData){
      // コントラクトオブジェクト作成
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({daiToken})
      // 残高取得
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({daiTokenBalance: daiTokenBalance.toString()})
      
      console.log(daiTokenBalance.toString());

      // DAPPTokenコントラクトのアドレスを取得。
      const dappTokenData = DappToken.networks[networkId];
      // アドレスを取得できた場合
      if(dappTokenData){
        // DappTokenコントラクトのオブジェクトを作成
        const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
        this.setState({dappToken})
        // 残高を取得する
        let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
        // String型に変換してステートを更新する。
        this.setState({dappTokenBalance: dappTokenBalance.toString()})
        
        console.log(dappTokenBalance.toString())
      }
    }else{
        window.alert('DaiToken contract not deployed to detected network.')
    }

    // tokenFarmコントラクトのアドレスを取得。
    const tokenFarmData = TokenFarm.networks[networkId]

    if(tokenFarmData){
      // TokenFarmコントラクトのオブジェクトを作成
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({tokenFarm})
      // ownerアドレスを取得する。
      let owner = await tokenFarm.methods.owner().call();
      console.log("owner:", owner);
      this.setState({owner});
      // ステーキングしている残高を取得する。
      let tokenFarmBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      // String型に変換してステートを更新する。
      this.setState({stakingBalance: tokenFarmBalance.toString()})
      
      console.log(tokenFarmBalance.toString())
    }else{
      window.alert('TokenFarm contract not deployed to detected network.')
    }
  }

  /**
   * ステーキング実行メソッド
   * @param {*} amount ステーキングする量
   */
  stakeTokens = (amount) => {
    this.setState({loading: true})
    // approveメソッドを呼び出した後にステーキング実行
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash)=> {
      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
    })
  }
  
  /**
   * unstakeTokensメソッド
   * @param {*} amount 引き出す量
   */
  unstakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }

  /**
   * Rewardトークンを発行するメソッド
   */
  issueTokens = () => {
    this.setState({loading: true})
    this.state.tokenFarm.methods.issueTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  };

  render() {
    let content

    if(this.state.loading){
      content = <p id='loader' className='text-center'>Loading...</p>
    }else{
      content = <Main
        account = {this.state.account}
        owner = {this.state.owner}
        daiTokenBalance = {this.state.daiTokenBalance}
        dappTokenBalance = {this.state.dappTokenBalance}
        stakingBalance = {this.state.stakingBalance}
        stakeTokens = {this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        issueTokens={this.issueTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="https://unchain-portal.netlify.app/home"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                <Box sx={{ flexGrow: 1, overflow: "hidden", px: 3, mt: 10}}>
                  <StyledPaper sx={{my: 1, mx: "auto", p: 0, borderRadius: 4, marginTop: 4}}>
                    {content}
                  </StyledPaper>
                </Box>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
