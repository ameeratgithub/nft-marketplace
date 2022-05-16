// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

library Utils {
    function compareStrings(string calldata _a, string calldata _b)
        public
        pure
        returns (bool)
    {
        return
            keccak256(abi.encode(_a)) == keccak256(abi.encode(_b));
    }
}
