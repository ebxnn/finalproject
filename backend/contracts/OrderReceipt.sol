// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OrderReceipt is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(string => uint256) public orderToToken;

    constructor() ERC721("FurnitureOrderReceipt", "FOR") {}

    function mintReceipt(address customer, string memory orderId, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        require(orderToToken[orderId] == 0, "Receipt already minted for this order");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(customer, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        orderToToken[orderId] = newTokenId;
        
        return newTokenId;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
} 