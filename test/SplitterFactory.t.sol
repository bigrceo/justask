// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SplitterFactory, FeeSplitter, IKaratLaunchpad} from "../contracts/SplitterFactory.sol";

interface ILaunchpadView {
    struct Launch {
        address token;
        address pairAsset;
        address creator;
        uint24 feePips;
        uint24 creatorSharePips;
        bool tokenIs0;
        int24 openingTick;
        int24 tickCap;
        int24 curveLower;
        int24 curveUpper;
        int24 reserveLower;
        int24 reserveUpper;
        uint128 curveLiquidity;
        uint128 reserveLiquidity;
    }
    function poolIdOf(address token) external view returns (bytes32);
    function launches(bytes32 id) external view returns (Launch memory);
    function pairAssets(address) external view returns (bool, uint8, uint256);
    function poolKeyOf(bytes32 id) external view returns (PoolKey memory);
    function collectPoolFees(bytes32 id) external;
}

interface IKaratRouter {
    struct Hop {
        PoolKey key;
        bool zeroForOne;
    }
    function swapExactInput(Hop[] calldata path, uint256 amountIn, uint256 minOut, address to)
        external
        payable
        returns (uint256);
}

/// @notice Against the live Karat launchpad on a Robinhood Chain fork.
///     FORK_RPC=http://127.0.0.1:8545 forge test -vv
contract SplitterFactoryForkTest is Test {
    address constant LAUNCHPAD = 0xD57759Fc069FF9f8901042E3df8f13708c0d9E6F;
    address constant ROUTER = 0x5b03CA37137FEb729a9E4427c5683998b4aB09e3;
    address constant NVDA = 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC;

    address operator = address(0x0BE7);
    address protocol = address(0xB0B);
    address user = address(0xA11CE);

    SplitterFactory factory;

    function setUp() public {
        vm.createSelectFork(vm.envOr("FORK_RPC", string("https://rpc.mainnet.chain.robinhood.com")));
        factory = new SplitterFactory(IKaratLaunchpad(LAUNCHPAD), operator, protocol);
        deal(NVDA, operator, 1 ether);
        vm.prank(operator);
        IERC20(NVDA).approve(address(factory), type(uint256).max);
    }

    function _launch() internal returns (address token, address splitter) {
        vm.prank(operator);
        return factory.launch("Just Ask", "ASK", "", NVDA, 20_000, 150_000, 0.01 ether, user, 5_000);
    }

    function test_nvdaIsWhitelisted() public view {
        (bool allowed,,) = ILaunchpadView(LAUNCHPAD).pairAssets(NVDA);
        assertTrue(allowed, "NVDA not a pair asset on the live launchpad");
    }

    function test_launchMakesSplitterTheCreator() public {
        (address token, address splitter) = _launch();
        ILaunchpadView.Launch memory l = ILaunchpadView(LAUNCHPAD).launches(ILaunchpadView(LAUNCHPAD).poolIdOf(token));
        assertEq(l.token, token);
        assertEq(l.creator, splitter, "fees would not reach the splitter");
        assertEq(l.creatorSharePips, 150_000);
        assertEq(IERC20(NVDA).balanceOf(operator), 1 ether - 0.01 ether);
    }

    function test_openingBuyGoesToUser() public {
        (address token, address splitter) = _launch();
        assertGt(IERC20(token).balanceOf(user), 0, "user got no tokens");
        assertEq(IERC20(token).balanceOf(splitter), 0);
    }

    function test_splitHalvesFees() public {
        (, address splitter) = _launch();
        deal(NVDA, splitter, 1001);
        FeeSplitter(splitter).split();
        assertEq(IERC20(NVDA).balanceOf(user), 500);
        assertEq(IERC20(NVDA).balanceOf(protocol), 501);
    }

    function test_onlyOperatorLaunches() public {
        vm.expectRevert("operator");
        factory.launch("x", "X", "", NVDA, 20_000, 150_000, 1, user, 5_000);
    }

    function test_splitterCannotBeReinitialized() public {
        (, address splitter) = _launch();
        vm.expectRevert("inited");
        FeeSplitter(splitter).init(address(this), address(this), NVDA, 10_000);
    }

    function test_holderGets75() public {
        vm.prank(operator);
        (, address splitter) = factory.launch("Just Ask", "ASK", "", NVDA, 20_000, 150_000, 0.01 ether, user, 7_500);
        deal(NVDA, splitter, 1000);
        FeeSplitter(splitter).split();
        assertEq(IERC20(NVDA).balanceOf(user), 750);
        assertEq(IERC20(NVDA).balanceOf(protocol), 250);
    }

    function test_noWalletAllToBurn() public {
        vm.prank(operator);
        (address token, address splitter) =
            factory.launch("Just Ask", "ASK", "", NVDA, 20_000, 150_000, 0.01 ether, address(0), 5_000);
        assertEq(FeeSplitter(splitter).beneficiary(), protocol);
        assertGt(IERC20(token).balanceOf(protocol), 0);
        deal(NVDA, splitter, 1000);
        FeeSplitter(splitter).split();
        assertEq(IERC20(NVDA).balanceOf(protocol), 1000);
    }

    /// Real trades, real Karat fee collection, then the split.
    function test_realFeesReachUser() public {
        (address token, address splitter) = _launch();
        bytes32 id = ILaunchpadView(LAUNCHPAD).poolIdOf(token);
        PoolKey memory key = ILaunchpadView(LAUNCHPAD).poolKeyOf(id);
        bool nvdaIs0 = Currency.unwrap(key.currency0) == NVDA;

        address trader = address(0x7EAD);
        deal(NVDA, trader, 0.5 ether);
        vm.startPrank(trader);
        IERC20(NVDA).approve(ROUTER, type(uint256).max);
        IKaratRouter.Hop[] memory path = new IKaratRouter.Hop[](1);
        path[0] = IKaratRouter.Hop(key, nvdaIs0);
        vm.warp(block.timestamp + 1 days); // past the launch guard and tax
        uint256 got = IKaratRouter(ROUTER).swapExactInput(path, 0.05 ether, 0, trader);
        IERC20(token).approve(ROUTER, type(uint256).max);
        path[0] = IKaratRouter.Hop(key, !nvdaIs0);
        IKaratRouter(ROUTER).swapExactInput(path, got / 2, 0, trader);
        vm.stopPrank();

        uint256 before = IERC20(NVDA).balanceOf(user);
        ILaunchpadView(LAUNCHPAD).collectPoolFees(id);
        uint256 fees = IERC20(NVDA).balanceOf(splitter);
        assertGt(fees, 0, "no creator fees reached the splitter");
        FeeSplitter(splitter).split();
        assertEq(IERC20(NVDA).balanceOf(user) - before, fees / 2);
        emit log_named_uint("creator fees in NVDA wei", fees);
    }
}
