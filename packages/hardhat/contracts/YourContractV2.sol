// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract YourContractV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
  // State Variables
  string public greeting;
  
  function _authorizeUpgrade(address) internal override onlyOwner {}

  // You have to pay some ETH to set the greeting 
  function setGreeting(string memory _greeting) public payable {
    require(msg.value > 0, "You have to pay some ETH to set the greeting");
    greeting = _greeting;
  }
}
