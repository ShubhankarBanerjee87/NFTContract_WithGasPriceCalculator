// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/// @custom:security-contact Contact@ "abc123@gmail.com"
contract TRON_COLLECTION is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable, ERC721Burnable {
    uint256 private _nextTokenId;

    event AllowedAddressAdded(address indexed allowedAddressAdded, address indexed addedBy);
    event AllowedAddressRemoved(address indexed allowedAddressRemoved, address indexed removedBy);

    mapping(address => bool) allowedAddress;

    constructor()
        ERC721("TRON_COLLECTION", "TCN")
        Ownable(msg.sender)
    {
       allowedAddress[msg.sender] = true; 
    }

    modifier isAllowedAddress(){
        require(allowedAddress[msg.sender], "Not an allowed address");
        _;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory uri) public isAllowedAddress {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function addAllowedAddress(address[] calldata newAllowedAddress) external onlyOwner returns(bool) {
        for(uint256 i=0; i<newAllowedAddress.length; i++){
            require(newAllowedAddress[i] != address(0), "Invalid Address");
            allowedAddress[newAllowedAddress[i]] = true;
            emit AllowedAddressAdded(newAllowedAddress[i], owner());
        }
        return true;
    }

    function removeAllowedAddress(address[] calldata allowedAddressToRemove) external onlyOwner returns(bool) {
        for(uint256 i=0; i<allowedAddressToRemove.length; i++){
            require(allowedAddressToRemove[i] != address(0), "Invalid Address");
            allowedAddress[allowedAddressToRemove[i]] = false;
            emit AllowedAddressRemoved(allowedAddressToRemove[i], owner());
        }
        return true;
    }

}