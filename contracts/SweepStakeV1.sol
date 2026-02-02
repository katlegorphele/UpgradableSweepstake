// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    UPGRADEABLE CONTRACT NOTES
    --------------------------
    - No constructor logic
    - Uses initializer()
    - Storage layout must NEVER change order
*/

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract EthRewardPoolUpgradeable is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    // Tracks current round number
    uint256 public roundId;

    // Timestamp when the current round started
    uint256 public roundStart;

    // Round duration (constant-like but upgrade-safe)
    uint256 public ROUND_DURATION;

    // Minimum ETH required to join
    uint256 public MIN_CONTRIBUTION;

    // Participants in the current round
    address payable[] public participants;

    // Prevents duplicate joins per round
    mapping(address => bool) public hasJoined;

    // Stores winner per round
    mapping(uint256 => address payable) public rewardHistory;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event ParticipantJoined(address indexed participant, uint256 amount);
    event RewardDistributed(address indexed recipient, uint256 amount, uint256 roundId);
    event NewRoundStarted(uint256 roundId);

    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the contract (replaces constructor)
     * @dev Can only be called once
     */
    function initialize() external initializer {
        // Initialize inherited upgradeable contracts
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Initialize round settings
        roundId = 1;
        roundStart = block.timestamp;
        ROUND_DURATION = 60 minutes;
        MIN_CONTRIBUTION = 0.000001 ether;

        emit NewRoundStarted(roundId);
    }

    /*//////////////////////////////////////////////////////////////
                        ACCESS CONTROL (UPGRADES)
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Required by UUPS pattern
     * Only the owner can authorize upgrades
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /*//////////////////////////////////////////////////////////////
                            MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Ensures the round is still active
     */
    modifier roundOpen() {
        require(
            block.timestamp < roundStart + ROUND_DURATION,
            "Round closed"
        );
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CORE LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Join the reward pool
     * @dev One entry per address per round
     */
    function joinPool()
        external
        payable
        virtual
        whenNotPaused
        roundOpen
        nonReentrant
    {
        require(!hasJoined[msg.sender], "Already joined");
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");

        participants.push(payable(msg.sender));
        hasJoined[msg.sender] = true;

        emit ParticipantJoined(msg.sender, msg.value);
    }

    /**
     * @notice Returns participants for the current round
     */
    function getParticipants()
        external
        view
        returns (address payable[] memory)
    {
        return participants;
    }

    /**
     * @notice Returns total ETH held by the pool
     */
    function getPoolBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    /*//////////////////////////////////////////////////////////////
                        RANDOMNESS (NON-SECURE)
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev ⚠️ NOT SECURE — for testing/education only
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
                        REWARD DISTRIBUTION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Selects a random winner and sends entire pool balance
     */
    function distributeReward()
        external
        virtual
        whenNotPaused
        nonReentrant
    {
        require(
            block.timestamp >= roundStart + ROUND_DURATION,
            "Round still active"
        );
        require(participants.length > 0, "No participants");

        uint256 index = _random() % participants.length;
        address payable winner = participants[index];

        uint256 prize = address(this).balance;
        (bool success, ) = winner.call{value: prize}("");
        require(success, "ETH transfer failed");

        rewardHistory[roundId] = winner;

        emit RewardDistributed(winner, prize, roundId);

        // Reset round state
        for (uint256 i = 0; i < participants.length; i++) {
            hasJoined[participants[i]] = false;
        }

        delete participants;

        roundId++;
        roundStart = block.timestamp;

        emit NewRoundStarted(roundId);
    }

    /*//////////////////////////////////////////////////////////////
                            EMERGENCY CONTROLS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Pause joins and reward distribution
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resume contract operation
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                        STORAGE GAP (UPGRADES)
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Reserved storage space for future upgrades
     * NEVER remove or reorder this
     */
    uint256[50] private __gap;
}
