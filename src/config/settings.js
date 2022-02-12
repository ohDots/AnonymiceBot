/*##############################################################################
# File: settings.js                                                            #
# Project: Anonymice - Discord Bot                                             #
# Author(s): Oliver Renner (@_orenner) & slingn.eth (@slingncrypto)            #
# © 2021                                                                       #
###############################################################################*/

const SVSABI = require("../contracts/svs.json");
const BuryABI = require("../contracts/bury.json");
const EtherealsABI = require("../contracts/ethereals.json");
const StakingABI = require("../contracts/staking.json");
const AnonymiceBreedingABI = require("../contracts/baby_mice_abi.json");

const settings = {
  rules: [
    //example of a generic/standard verification rule
    //checks whether the signers wallet holds at least 1 
    //token from the specified contract
    // {
    //   name: "Baby Mice",
    //   roleId: "918771367074201631",
    //   executor: {
    //     type: "GenericContractVerificationRule.js",
    //     config: {
    //       contractAddress: "0x15cc16bfe6fac624247490aa29b6d632be549f00",
    //       contractAbi: AnonymiceBreedingABI,
    //       method: "balanceOf",
    //     },
    //   },
    // },
    // completely customized verification rule
    {
      name: "Ethereal Verifier",
      roleId: "938211628007174194",
      executor: {
        type: "GenericContractVerificationRule.js",
        config: {

          roles: [
            {
              name: "test",
              id: "941861173421285458"
            }
          ],
          EtherealsContract: {
            Address: "0x6faca07a3ed40f27be36ae1c687e073b38bdf310",
            ABI: EtherealsABI,
          },
          StakingContract: {
            Address: "0x3E822513712EBAAA2B44dF4236de716a5F1DEF0B",
            ABI: StakingABI,
          },          
          SVSContract: {
            Address: "0x219B8aB790dECC32444a6600971c7C3718252539",
            ABI: SVSABI,
          },
          BuryContract: {
            Address: "0x12753244901f9E612A471c15C7E5336e813D2e0B",
            ABI: BuryABI,
          },
          
        },
      },
    },
  ],
};

module.exports = settings;
