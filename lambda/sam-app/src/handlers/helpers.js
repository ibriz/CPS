const IconService = require('icon-sdk-js');
const { IconBuilder, HttpProvider } = IconService;

const provider = new HttpProvider(process.env.ICON_PROVIDER);
const iconService = new IconService(provider);

async function contractMethodCallService (scoreAddr, method, params=null) {
    const callObj = new IconBuilder.CallBuilder()
        .to(scoreAddr)
        .method(method)
        .params(params)
        .build();
    return await iconService.call(callObj).execute();
}

module.exports = {
    iconService,
    contractMethodCallService
}