
async function onUpdated(tabId, changeInfo, tabInfo) {

	if(changeInfo.status === "complete") {
		try {
			let tmp = await browser.tabs.executeScript(tabId, { file: 'content-script.js' });
			tmp = tmp[0];
			if (tmp.length > 0) {
				await browser.pageAction.show(tabId);

			}
		}catch(e){
			console.error(e);
		}
	}

}

browser.tabs.onUpdated.addListener(onUpdated, {properties: ["status"]});
