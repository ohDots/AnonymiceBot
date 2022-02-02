/*##############################################################################
# File: genericContractVerifier.js                                             #
# Project: Anonymice - Discord Bot                                             #
# Author(s): Oliver Renner (@_orenner) & slingn.eth (@slingncrypto)            #
# © 2021                                                                       #
###############################################################################*/

const getProvider = require("../web3/provider");
const { Contract } = require("ethers");

class GenericContractVerificationRule {
  constructor(config) {
    this.config = config;
    this.logger = require("../utils/logger");
  }

  /**
   * Executes changes to the Discord Users assigned roles using the result from
   * the check method
   * 
   * @param discordUser - The Discord User
   * @param role - The Discord Role which should be affected
   * @param result - The result returned from the check method
   */
  async execute(discordUser, role, result) {
    try {

      if (!role) {
        this.logger.info("Role not found, please make sure to use the correct role id.")
        return;
      }

      let userQualifiesForRole = result === true;
      
      if (userQualifiesForRole && !discordUser.roles.cache.has(role.id)) {
        this.logger.info(`Assigning Role: ${role.name}`);
        await discordUser.roles.add(role);
      } else {
        if (discordUser.roles.cache.has(role.id)) {
          this.logger.info(`Removing Role: ${role.name}`);
          await discordUser.roles.remove(role);
        }
      }

      return {
        role: role.name,
        roleId: role.id,
        qualified: userQualifiesForRole,
        result: result
      }

    } catch (err) {
      this.logger.error(err.message);
    }
  }

  /**
   * Executes the Contract method specified and returns the result
   * 
   * @param user - The User DB record
   * @returns a result to be consumed in the execute method
   */
  async check(user) {
    let logMessage = `Generic Contract Executor is executing:
Contract:       ${this.config.contractAddress}
Method:         ${this.config.method}
Argument(s):    ${user.walletAddress}`;
    try {
      const provider = await getProvider();
      const svsContract = new Contract(
        this.config.SVSContract.Address,
        this.config.SVSContract.ABI,
        provider
      );
      const buryContract = new Contract(
        this.config.BuryContract.Address,
        this.config.BuryContract.ABI,
        provider
      );
      let svsContractResult = await svsContract["balanceOf"](user.walletAddress);
      let buryContractResult = await buryContract["balanceOf"](user.walletAddress);

      let result = svsContractResult.toNumber() > 0 || buryContractResult > 0;
      logMessage += `
SVS Result:       ${svsContractResult}`;
logMessage += `
Bury Result:       ${buryContractResult}`;
      this.logger.info(logMessage);
      return result;
    } catch (e) {
      this.logger.error(e.message);
      return false;
    }
  }
}

module.exports = GenericContractVerificationRule;
