// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    V3 CHANGES
    ----------
    - distribureRewards ends empty games
    - Uses reinitializer(3) to remain upgrade-safe
*/

import "./Sweepstake_V2.sol";

contract EthRewardPoolUpgradeableV3 is EthRewardPoolUpgradeableV2 {
    /*//////////////////////////////////////////////////////////////
                            NEW STORAGE (APPENDED)
    //////////////////////////////////////////////////////////////*/


    /*//////////////////////////////////////////////////////////////
                        V2 INITIALIZATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes V3 state variables
     * @dev Runs only once and only after V1 initialization
     */
    /// @custom:oz-upgrades-validate-as-initializer
    function initializeV3() external reinitializer(3) {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();

    }

    /*//////////////////////////////////////////////////////////////
                        OVERRIDDEN CORE LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Distribute reward to a random participant (V3)
     * @dev Failsafe added to ensure round is finished
     */
   function distributeReward()
        external
        override
        whenNotPaused
        nonReentrant
    {
        require(
            block.timestamp >= roundStart + ROUND_DURATION,
            "Round still active"
        );
        if (participants.length == 0) {
            // No participants, skip reward distribution
            roundId++;
            roundStart = block.timestamp;
            emit NewRoundStarted(roundId);
            return;
        }

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
                        STORAGE GAP (UPDATED)
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Reduce the storage gap by 1 slot
     * since we added MAX_PARTICIPANTS
     */
    uint256[49] private __gap;
}
