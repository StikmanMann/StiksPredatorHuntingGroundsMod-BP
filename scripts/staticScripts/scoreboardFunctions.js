import { system, world } from "@minecraft/server";
export { ScoreboardFunctions };
//Object.defineProperties(Player.prototype)
class ScoreboardFunctions {
    /**
     * Change the name of a player across all scoreboards.
     * @param {string} oldName - The old name of the player.
     * @param {string} newName - The new name to set for the player.
     */
    static nameChange(oldName, newName) {
        system.run(() => {
            world.scoreboard.getObjectives().forEach(scoreboard => {
                const oldScore = scoreboard.getScore(oldName) ?? 0;
                scoreboard.setScore(newName, oldScore);
                scoreboard.removeParticipant(oldName);
            });
        });
    }
    /**
     * Get the score for a player on a specific scoreboard.
     * If the player or scoreboard is not found, return 0.
     * @param {Player | string} player - The player or player name.
     * @param {ScoreboardObjective | string} scoreboardId - The objective or objective ID.
     * @returns {number} - The score for the player on the scoreboard.
     */
    static getScore(player, scoreboardId) {
        //system.run(() => {
        let playerName;
        let objectiveId;
        if (typeof player === 'string') {
            playerName = player;
        }
        else {
            playerName = player.nameTag;
        }
        if (typeof scoreboardId === 'string') {
            objectiveId = scoreboardId;
        }
        else {
            objectiveId = scoreboardId.id;
        }
        //world.sendMessage(`ACtual vlaue i think: ${ world.scoreboard.getObjective(objectiveId)?.getScore(playerName) ?? 0}`)
        return world.scoreboard.getObjective(objectiveId)?.getScore(playerName) ?? 0;
        // });
    }
    /**
     * Set the score for a player on a specific scoreboard.
     * @param {Player | string} player - The player or player name.
     * @param {ScoreboardObjective | string} scoreboardId - The objective or objective ID.
     * @param {number} value - The value to set for the player's score.
     * @returns {Promise<void>}
     */
    static setScore(player, scoreboardId, value) {
        return new Promise((resolve) => {
            system.run(() => {
                let playerName;
                let objectiveId;
                if (typeof player === 'string') {
                    playerName = player;
                }
                else {
                    playerName = player.nameTag;
                }
                if (typeof scoreboardId === 'string') {
                    objectiveId = scoreboardId;
                }
                else {
                    objectiveId = scoreboardId.id;
                }
                world.scoreboard.getObjective(objectiveId).setScore(playerName, value);
                resolve(player);
            });
        });
    }
    /**
     * Remove a participant (player) from a specific scoreboard.
     * @param {Player | string} player - The player or player name to remove.
     * @param {ScoreboardObjective | string} scoreboardId - The objective or objective ID.
     */
    static removeParticipant(player, scoreboardId) {
        system.run(() => {
            let playerName;
            let objectiveId;
            if (typeof player === 'string') {
                playerName = player;
            }
            else {
                playerName = player.nameTag;
            }
            if (typeof scoreboardId === 'string') {
                objectiveId = scoreboardId;
            }
            else {
                objectiveId = scoreboardId.id;
            }
            world.scoreboard.getObjective(objectiveId)?.removeParticipant(playerName);
        });
    }
}
