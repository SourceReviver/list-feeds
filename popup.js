
const extId = 'list-feeds'

async function init() {

	try {
	await browser.tabs.executeScript({ file: 'content-script.js' });

	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	const objs = await browser.tabs.sendMessage(tabs[0].id, { cmd: extId });

	const tbl = document.getElementById('feedlist');

	//
	tbl.textContent = objs.length + ' Feeds found'
	if (objs.length < 1) { return; }
	if (objs.length === 1) {
		tbl.textContent = '1 Feed found'
	} 

	//
	let idCounter = 1
	objs.forEach((url) => {

		const tr = tbl.insertRow()
		const a = document.createElement('a')

		a.textContent = url
		a.href = url

		var td1 = tr.insertCell()
		td1.textContent = idCounter + '. '
		td1.appendChild(a)
		idCounter++

	});
	}catch(e){
		console.error(e);
	}

}

init();

