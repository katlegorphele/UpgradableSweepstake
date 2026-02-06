// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    CELO SWEEPSTAKE V1
    ------------------
    Multi-token sweepstake supporting:
    - Native CELO
    - cUSD (Mento USD stablecoin)
    - cZAR (Mento ZAR stablecoin)

    Ticket price: R20 equivalent in each token
    Prize: Always paid in cZAR
*/

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract CeloSweepstakeV1 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    // Round management
    uint256 public roundId;
    uint256 public roundStart;
    uint256 public ROUND_DURATION;
    uint256 public MAX_PARTICIPANTS;

    // Token addresses (Celo Sepolia)
    address public CUSD_TOKEN;
    address public CZAR_TOKEN;

    // Ticket prices per token (base: R20 ZAR)
    uint256 public TICKET_PRICE_CELO;  // ~2.5 CELO
    uint256 public TICKET_PRICE_CUSD;  // ~1.1 cUSD
    uint256 public TICKET_PRICE_CZAR;  // 20 cZAR (exact)

    // Pool balances per token
    uint256 public poolBalanceCELO;
    uint256 public poolBalanceCUSD;
    uint256 public poolBalanceCZAR;

    // Participants in current round
    address payable[] public participants;
    mapping(address => bool) public hasJoined;
    mapping(address => address) public participantPaymentToken; // Track payment token per participant

    // Enhanced winner history
    struct WinnerInfo {
        address winner;
        uint256 prizeAmount;
        uint256 timestamp;
    }
    mapping(uint256 => WinnerInfo) public rewardHistory;

    // Manual swap mode (owner converts tokens externally before distribution)
    bool public manualSwapMode;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event ParticipantJoined(
        address indexed participant,
        address indexed token,
        uint256 amount,
        uint256 roundId
    );

    event RewardDistributed(
        address indexed winner,
        uint256 prizeAmount,
        uint256 roundId
    );

    event NewRoundStarted(uint256 roundId);

    event TicketPricesUpdated(
        uint256 celoPrice,
        uint256 cusdPrice,
        uint256 czarPrice
    );

    event TokensWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    event CZARDeposited(address indexed from, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the contract
     * @param _cusdToken Address of cUSD token
     * @param _czarToken Address of cZAR token
     * @param _ticketPriceCelo Ticket price in CELO (wei)
     * @param _ticketPriceCusd Ticket price in cUSD (wei)
     * @param _ticketPriceCzar Ticket price in cZAR (wei)
     */
    function initialize(
        address _cusdToken,
        address _czarToken,
        uint256 _ticketPriceCelo,
        uint256 _ticketPriceCusd,
        uint256 _ticketPriceCzar
    ) external initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        CUSD_TOKEN = _cusdToken;
        CZAR_TOKEN = _czarToken;

        TICKET_PRICE_CELO = _ticketPriceCelo;
        TICKET_PRICE_CUSD = _ticketPriceCusd;
        TICKET_PRICE_CZAR = _ticketPriceCzar;

        ROUND_DURATION = 5 minutes;
        MAX_PARTICIPANTS = 100;
        manualSwapMode = true; // Start with manual mode

        roundId = 1;
        roundStart = block.timestamp;

        emit NewRoundStarted(roundId);
    }

    /*//////////////////////////////////////////////////////////////
                        ACCESS CONTROL (UPGRADES)
    //////////////////////////////////////////////////////////////*/

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /*//////////////////////////////////////////////////////////////
                            MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier roundOpen() {
        require(
            block.timestamp < roundStart + ROUND_DURATION,
            "Round closed"
        );
        _;
    }

    modifier validToken(address token) {
        require(
            token == CUSD_TOKEN || token == CZAR_TOKEN,
            "Invalid token"
        );
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CORE LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Join pool with native CELO
     */
    function joinPoolWithCELO()
        external
        payable
        whenNotPaused
        roundOpen
        nonReentrant
    {
        require(!hasJoined[msg.sender], "Already joined");
        require(msg.value >= TICKET_PRICE_CELO, "Contribution too small");
        require(participants.length < MAX_PARTICIPANTS, "Round is full");

        participants.push(payable(msg.sender));
        hasJoined[msg.sender] = true;
        participantPaymentToken[msg.sender] = address(0); // Native CELO
        poolBalanceCELO += msg.value;

        emit ParticipantJoined(msg.sender, address(0), msg.value, roundId);
    }

    /**
     * @notice Join pool with ERC20 token (cUSD or cZAR)
     * @param token Address of the token to pay with
     */
    function joinPoolWithToken(address token)
        external
        whenNotPaused
        roundOpen
        nonReentrant
        validToken(token)
    {
        require(!hasJoined[msg.sender], "Already joined");
        require(participants.length < MAX_PARTICIPANTS, "Round is full");

        uint256 ticketPrice = token == CUSD_TOKEN
            ? TICKET_PRICE_CUSD
            : TICKET_PRICE_CZAR;

        // Transfer tokens from user
        bool success = IERC20(token).transferFrom(
            msg.sender,
            address(this),
            ticketPrice
        );
        require(success, "Token transfer failed");

        participants.push(payable(msg.sender));
        hasJoined[msg.sender] = true;
        participantPaymentToken[msg.sender] = token;

        if (token == CUSD_TOKEN) {
            poolBalanceCUSD += ticketPrice;
        } else {
            poolBalanceCZAR += ticketPrice;
        }

        emit ParticipantJoined(msg.sender, token, ticketPrice, roundId);
    }

    /**
     * @notice Distribute reward to random winner
     * @dev In manual swap mode, owner must ensure sufficient cZAR balance
     */
    function distributeReward()
        external
        whenNotPaused
        nonReentrant
    {
        require(
            block.timestamp >= roundStart + ROUND_DURATION,
            "Round still active"
        );

        if (participants.length == 0) {
            // No participants, start new round
            roundId++;
            roundStart = block.timestamp;
            emit NewRoundStarted(roundId);
            return;
        }

        // Calculate total prize in cZAR
        uint256 totalPrize = poolBalanceCZAR;

        // In manual swap mode, owner should have already converted CELO/cUSD to cZAR
        // The prize is whatever cZAR is in the contract
        if (manualSwapMode) {
            totalPrize = IERC20(CZAR_TOKEN).balanceOf(address(this));
        }

        require(totalPrize > 0, "No prize to distribute");

        // Select random winner
        uint256 index = _random() % participants.length;
        address payable winner = participants[index];

        // Transfer prize in cZAR
        bool success = IERC20(CZAR_TOKEN).transfer(winner, totalPrize);
        require(success, "Prize transfer failed");

        // Store winner info
        rewardHistory[roundId] = WinnerInfo({
            winner: winner,
            prizeAmount: totalPrize,
            timestamp: block.timestamp
        });

        emit RewardDistributed(winner, totalPrize, roundId);

        // Reset round state
        _resetRound();

        roundId++;
        roundStart = block.timestamp;

        emit NewRoundStarted(roundId);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get all pool balances
     */
    function getPoolBalances()
        external
        view
        returns (uint256 celo, uint256 cusd, uint256 czar)
    {
        return (poolBalanceCELO, poolBalanceCUSD, poolBalanceCZAR);
    }

    /**
     * @notice Get all ticket prices
     */
    function getTicketPrices()
        external
        view
        returns (uint256 celo, uint256 cusd, uint256 czar)
    {
        return (TICKET_PRICE_CELO, TICKET_PRICE_CUSD, TICKET_PRICE_CZAR);
    }

    /**
     * @notice Get participants for current round
     */
    function getParticipants()
        external
        view
        returns (address payable[] memory)
    {
        return participants;
    }

    /**
     * @notice Get total participants count
     */
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    /**
     * @notice Get winner info for a specific round
     */
    function getWinnerInfo(uint256 _roundId)
        external
        view
        returns (address winner, uint256 prizeAmount, uint256 timestamp)
    {
        WinnerInfo memory info = rewardHistory[_roundId];
        return (info.winner, info.prizeAmount, info.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update ticket prices
     */
    function setTicketPrices(
        uint256 _celoPrice,
        uint256 _cusdPrice,
        uint256 _czarPrice
    ) external onlyOwner {
        TICKET_PRICE_CELO = _celoPrice;
        TICKET_PRICE_CUSD = _cusdPrice;
        TICKET_PRICE_CZAR = _czarPrice;

        emit TicketPricesUpdated(_celoPrice, _cusdPrice, _czarPrice);
    }

    /**
     * @notice Set manual swap mode
     */
    function setManualSwapMode(bool enabled) external onlyOwner {
        manualSwapMode = enabled;
    }

    /**
     * @notice Withdraw accumulated tokens (for manual swap)
     * @param token Address of token (address(0) for CELO)
     * @param amount Amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            require(amount <= poolBalanceCELO, "Insufficient CELO");
            poolBalanceCELO -= amount;
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "CELO transfer failed");
        } else if (token == CUSD_TOKEN) {
            require(amount <= poolBalanceCUSD, "Insufficient cUSD");
            poolBalanceCUSD -= amount;
            IERC20(CUSD_TOKEN).transfer(msg.sender, amount);
        } else if (token == CZAR_TOKEN) {
            require(amount <= poolBalanceCZAR, "Insufficient cZAR");
            poolBalanceCZAR -= amount;
            IERC20(CZAR_TOKEN).transfer(msg.sender, amount);
        }

        emit TokensWithdrawn(token, msg.sender, amount);
    }

    /**
     * @notice Deposit cZAR for prize (after manual swap)
     */
    function depositCZARForPrize(uint256 amount) external onlyOwner {
        require(manualSwapMode, "Manual swap mode not enabled");
        bool success = IERC20(CZAR_TOKEN).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "cZAR transfer failed");
        poolBalanceCZAR += amount;

        emit CZARDeposited(msg.sender, amount);
    }

    /**
     * @notice Update token addresses
     */
    function setTokenAddresses(
        address _cusdToken,
        address _czarToken
    ) external onlyOwner {
        CUSD_TOKEN = _cusdToken;
        CZAR_TOKEN = _czarToken;
    }

    /**
     * @notice Update round settings
     */
    function setRoundSettings(
        uint256 _duration,
        uint256 _maxParticipants
    ) external onlyOwner {
        ROUND_DURATION = _duration;
        MAX_PARTICIPANTS = _maxParticipants;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Reset round state
     */
    function _resetRound() internal {
        for (uint256 i = 0; i < participants.length; i++) {
            hasJoined[participants[i]] = false;
            delete participantPaymentToken[participants[i]];
        }
        delete participants;

        // Reset pool balances
        poolBalanceCELO = 0;
        poolBalanceCUSD = 0;
        poolBalanceCZAR = 0;
    }

    /**
     * @dev Pseudo-random number generator (NOT SECURE - for testing only)
     */
    function _random() internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    participants.length,
                    roundId
                )
            )
        );
    }

    /*//////////////////////////////////////////////////////////////
                        STORAGE GAP (UPGRADES)
    //////////////////////////////////////////////////////////////*/

    uint256[40] private __gap;

    /**
     * @dev Receive native CELO
     */
    receive() external payable {}
}
