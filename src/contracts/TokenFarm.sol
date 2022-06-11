//SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./MockDaiToken.sol";

contract TokenFarm{

      string public name = "Dapp Token Farm";
      DappToken public dappToken;
      DaiToken public daiToken;
      address public owner;
      // array of staker's addresses
      address[] public stakers;

      mapping (address => uint) public stakingBalance;
      mapping (address => bool) public hasStaked;
      mapping (address => bool) public isStaking;

      constructor(DappToken _dappToken, DaiToken _daiToken) public {
            dappToken = _dappToken;
            daiToken = _daiToken;
            owner = msg.sender;
      }

      /**
       * staking func
       */
      function stakeTokens(uint _amount) public {
            // check amount
            require(_amount > 0, "amount can't be 0");
            // send amount from msg.sender to this contract
            daiToken.transferFrom(msg.sender, address(this), _amount);

            stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

            // add to Array
            if(!hasStaked[msg.sender]){
                  stakers.push(msg.sender);
            }
            // update staking status!!
            isStaking[msg.sender] = true;
            hasStaked[msg.sender] = true;
      }

      /**
       * issue token func
       */
      function issueTokens() public {
            // check msg.sender is owner
            require(msg.sender == owner, "caller must be the owner");

            // issue
            for(uint i=0; i<stakers.length; i++){
                  // get addresses
                  address recipient = stakers[i];
                  // get balance
                  uint balance = stakingBalance[recipient];

                  if(balance > 0){
                        // send Dapp token
                        dappToken.transfer(recipient, balance);
                  }
            }
      }

      /**
       * unstake func 
       */
      function unstakeTokens() public {
            // get staking balance 
            uint balance = stakingBalance[msg.sender];
            // check balance
            require(balance > 0, "staking balance cannot be 0");
            // send dai token
            daiToken.transfer(msg.sender, balance);
            // update staking balance and status!!
            stakingBalance[msg.sender] = 0;
            isStaking[msg.sender] = false;
      }
}