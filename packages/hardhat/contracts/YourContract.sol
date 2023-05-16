// contracts/MyTokenV1.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract YourContract is Initializable, UUPSUpgradeable, OwnableUpgradeable {
  // State Variables
  string public greeting;
  
  function initialize(address owner) public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();
    transferOwnership(owner);

    greeting = "Bulding Unstopaple Apps!!!";
  }

  function _authorizeUpgrade(address) internal override onlyOwner {}

  // Anyone can set the greeting for free
  function setGreeting(string memory _greeting) public {
    greeting = _greeting;
  }
}
