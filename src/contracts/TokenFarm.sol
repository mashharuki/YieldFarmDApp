//SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./MockDaiToken.sol";

contract TokenFarm{

      string public name = "Dapp Token Farm";
      DappToken public dappToken;
      DaiToken public daiToken;
      // array of staker's addresses
      address[] public stakers;

      mapping (address => uint) public stakingBalance;
      mapping (address => bool) public hasStaked;
      mapping (address => bool) public isStaking;

      constructor(DappToken _dappToken, DaiToken _daiToken) public {
            dappToken = _dappToken;
            daiToken = _daiToken;
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


}