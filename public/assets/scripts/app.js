/* --------------------------------------------------------- */
/* document ready */
$(() => {
    if (!hasWeb3()) {
        $("#web3-error-popup").show();
    } else {
        init();
    }
});
/* --------------------------------------------------------- */

/* --------------------------------------------------------- */
/* apis */
const apiUrlSignIn = "/api/sign_in";
/* --------------------------------------------------------- */

/* --------------------------------------------------------- */
/* utility methods */
const hasWeb3 = function () {
    return window.ethereum !== undefined;
};

function displayAddress(address, cb) {
    provider.lookupAddress(address).then((res) => {
        let result = res || address.substring(0, 8);
        cb(result);
    });
}

/* --------------------------------------------------------- */

/* --------------------------------------------------------- */
/* app */
const init = async () => {
    window.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    window.signer = provider.getSigner();
    await provider.send("eth_requestAccounts", []);
    let address = await signer.getAddress();
    window.account = ethers.utils.getAddress(address);
    $("#walletAddressValue").text(account);

    displayAddress(account, (ens) => {
        $("#walletAddressValue").text(ens || account);
    });

    $("#signin").click(async () => {
        $("#signin").prop('disabled', true);
        await signMessage().catch(() => $("#signin").prop('disabled', false));
    });
};
/* --------------------------------------------------------- */

/* signature process */

const generateMessage = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let message = {
        domain: document.location.host,
        address: window.account,
        chainId: `${await provider.getNetwork().then(({chainId}) => chainId)}`,
        uri: document.location.origin,
        version: "1",
        statement: "Anonymice Discord Bot",
        type: "Personal signature",
        nonce: urlParams.get("requestId"),
    };

    return message;
};

const amountOfMemes = 5;
let memeIdx = 1;
const nextMeme = () => {
    memeIdx += 1;
    if (memeIdx > amountOfMemes) {
        memeIdx = 1;
    }
    $(".meme-img").attr("src", "assets/images/meme_" + memeIdx + ".png");
}

const signMessage = async () => {
    let message = await generateMessage();
    let jsonMessage = JSON.stringify(message);
    let signature = await provider.getSigner().signMessage(jsonMessage);

    $(".memes").removeClass('hidden');
    message.signature = signature;

    fetch(apiUrlSignIn, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {"Content-Type": "application/json"},
        credentials: "include",
    })
        .then(handleFetchErrors)
        .then(async (res) => {
            $("#signin").prop('disabled', false);
            if (res.status === 200) {
                res.json().then(data => {
                    let roles = data.status.roles.join(", ");
                    if (roles) {
                        $(".success-bad").addClass('hidden');
                        $(".roles").text(roles);
                    } else {
                        $(".success-good").addClass('hidden');
                        $(".roles").text("None. Please verify again with a different wallet.");
                    }
                    $(".verify").addClass('hidden');
                    $(".meme-message").addClass('hidden');
                    $(".success").removeClass('hidden');
                });
            } else {
                res.json().then((err) => {
                    console.error(err);
                });
            }
        })
        .catch((err) => {
            $("#signin").prop('disabled', false);
            console.error(err);
        });
};

const handleFetchErrors = async (response) => {
    if (!response.ok) {
        var responseMessage = await response.json().then(data => {
            $("#errorText").text(data.message);
            $("#error-popup-button").show();
            $("#error-popup").show();
        })

    }
    return response;
};

const closeErrorPopup = () => {
    $("#errorText").text('');
    $("#error-popup-button").hide();
    $("#error-popup").hide();
};
