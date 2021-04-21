
async function init() {

	const tbl = document.getElementById('feedlist');


	try {
		let objs = await browser.tabs.executeScript({ file: 'content-script.js' });

		objs = objs[0];

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
		tbl.textContent = '0 Feeds found'
	}

}

init();

