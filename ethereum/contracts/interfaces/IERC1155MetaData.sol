// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

interface IERC1155MetaData {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);
}
