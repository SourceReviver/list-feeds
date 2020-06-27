
const extId = "list-feeds";

function onError(e){console.log(`${extId}::onError: ${e}`);}

browser.tabs.executeScript({file: "content-script.js"}).then( () => {

	return browser.tabs.query({active: true, currentWindow: true}).then( (tabs) => {

		return browser.tabs.sendMessage(tabs[0].id, { cmd: extId,}).then( (objs) => {

			let tbl = document.getElementById('feedlist');
			//

			tbl.textContent = objs.length + ' Feeds found';
			if(objs.length < 1){ return; } 
			if(objs.length === 1){ 
				tbl.textContent = '1 Feed found'; 
			}else{
				function compare(a, b) {
					if (a.url > b.url) return 1;
					if (b.url > a.url) return -1;
					return 0;
				}
				//
				objs.sort(compare);
			}

			// 
			let id_count = 1;
			objs.forEach( (obj) => {

				const url = obj.url;
				const type = obj.type;

				let tr = tbl.insertRow();

				let a = document.createElement('a');

				a.textContent = url;
				a.href = url;


				var td_1 = tr.insertCell();
				td_1.textContent = id_count + ". ";
				td_1.appendChild(a);
				id_count++;

				var td_2 = tr.insertCell();
				td_2.textContent = type;

			});

		});

	});

}).catch(onError);
