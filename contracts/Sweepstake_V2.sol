// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    V2 CHANGES
    ----------
    - Round duration reduced to 5 minutes
    - Maximum participants per round enforced
    - Uses reinitializer(2) to remain upgrade-safe
*/

import "./SweepStakeV1.sol";

contract EthRewardPoolUpgradeableV2 is EthRewardPoolUpgradeable {
    /*//////////////////////////////////////////////////////////////
                            NEW STORAGE (APPENDED)
    //////////////////////////////////////////////////////////////*/

    // Maximum number of participants allowed per round
    uint256 public MAX_PARTICIPANTS;

    /*//////////////////////////////////////////////////////////////
                        V2 INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes V2 state variables
     * @dev Runs only once and only after V1 initialization
     */
    /// @custom:oz-upgrades-validate-as-initializer
    function initializeV2() external reinitializer(2) {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        /*
            Reduce round duration to 5 minutes.
            This safely updates the existing storage variable
            introduced in V1.
        */
        ROUND_DURATION = 5 minutes;

        /*
            Cap participants per round to prevent
            gas-intensive loops and DoS risks.
        */
        MAX_PARTICIPANTS = 100;
    }

    /*//////////////////////////////////////////////////////////////
                        OVERRIDDEN CORE LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  (V2)
     * @dev Enforces maximum participant limit
     */
    function joinPool()
        external
        payable
        override
        whenNotPaused
        roundOpen
        nonReentrant
    {
        require(!hasJoined[msg.sender], "Already joined");
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");
        require(
            participants.length < MAX_PARTICIPANTS,
            "Round is full"
        );

        participants.push(payable(msg.sender));
        hasJoined[msg.sender] = true;

        emit ParticipantJoined(msg.sender, msg.value);
    }

    /*//////////////////////////////////////////////////////////////
                        STORAGE GAP (UPDATED)
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Reduce the storage gap by 1 slot
     * since we added MAX_PARTICIPANTS
     */
    uint256[49] private __gap;
}
