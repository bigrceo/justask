// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

interface IKaratLaunchpad {
    function create(
        string calldata name,
        string calldata symbol,
        string calldata logoURI,
        address pairAsset,
        uint24 feePips,
        uint24 creatorSharePips,
        uint256 firstBuyAmount
    ) external returns (address token, bytes32 poolId);
}

/// @notice Karat pays creator fees to `msg.sender` of `create`. Each launch goes
///         through its own splitter clone so it is the creator, and anyone can push
///         its balance out: half to the user, half to the protocol buyback wallet.
contract FeeSplitter {
    using SafeERC20 for IERC20;

    address public beneficiary;
    address public protocol;
    address public pairAsset;
    address public factory;
    /// @notice The user's cut of every fee payout, in bps. Set once, at launch.
    uint16 public userBps;

    event Split(uint256 toUser, uint256 toProtocol);

    function init(address beneficiary_, address protocol_, address pairAsset_, uint16 userBps_) external {
        require(factory == address(0), "inited");
        require(userBps_ <= 10_000, "bps");
        factory = msg.sender;
        // No wallet given: everything goes to the burn.
        if (beneficiary_ == address(0)) (beneficiary_, userBps_) = (protocol_, 0);
        beneficiary = beneficiary_;
        protocol = protocol_;
        pairAsset = pairAsset_;
        userBps = userBps_;
    }

    function create(
        IKaratLaunchpad launchpad,
        string calldata name,
        string calldata symbol,
        string calldata logoURI,
        uint24 feePips,
        uint24 creatorSharePips,
        uint256 firstBuy
    ) external returns (address token) {
        require(msg.sender == factory, "factory");
        IERC20(pairAsset).forceApprove(address(launchpad), firstBuy);
        (token,) = launchpad.create(name, symbol, logoURI, pairAsset, feePips, creatorSharePips, firstBuy);
        // The opening buy's tokens land here; hand them to the user.
        IERC20(token).safeTransfer(beneficiary, IERC20(token).balanceOf(address(this)));
    }

    function split() external {
        uint256 bal = IERC20(pairAsset).balanceOf(address(this));
        uint256 toUser = (bal * userBps) / 10_000;
        if (toUser != 0) IERC20(pairAsset).safeTransfer(beneficiary, toUser);
        if (bal != toUser) IERC20(pairAsset).safeTransfer(protocol, bal - toUser);
        emit Split(toUser, bal - toUser);
    }
}

contract SplitterFactory {
    using SafeERC20 for IERC20;

    IKaratLaunchpad public immutable launchpad;
    address public immutable implementation;
    address public immutable operator;
    address public immutable protocol;

    event Launched(address indexed token, address indexed splitter, address indexed beneficiary);

    constructor(IKaratLaunchpad launchpad_, address operator_, address protocol_) {
        launchpad = launchpad_;
        operator = operator_;
        protocol = protocol_;
        implementation = address(new FeeSplitter());
    }

    function launch(
        string calldata name,
        string calldata symbol,
        string calldata logoURI,
        address pairAsset,
        uint24 feePips,
        uint24 creatorSharePips,
        uint256 firstBuy,
        address beneficiary,
        uint16 userBps
    ) external returns (address token, address splitter) {
        require(msg.sender == operator, "operator");
        splitter = Clones.clone(implementation);
        FeeSplitter(splitter).init(beneficiary, protocol, pairAsset, userBps);
        IERC20(pairAsset).safeTransferFrom(msg.sender, splitter, firstBuy);
        token = FeeSplitter(splitter).create(launchpad, name, symbol, logoURI, feePips, creatorSharePips, firstBuy);
        emit Launched(token, splitter, beneficiary);
    }
}
