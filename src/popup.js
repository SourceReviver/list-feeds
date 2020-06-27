
const extId = "list-feeds";

function onError(e){console.log(`${extId}::onError: ${e}`);}

browser.tabs.executeScript({file: "content-script.js"}).then( () => {

	return browser.tabs.query({active: true, currentWindow: true}).then( (tabs) => {

		return browser.tabs.sendMessage(tabs[0].id, { cmd: extId,}).then( (objs) => {

			let ol = document.getElementById('feedlist');
			//
			ol.innerHTML= '<strong>Number of Feeds found: ' + objs.length + '</strong>';
			if(objs.length < 1){ return; }
			// 
			objs.forEach( (obj) => {

				const url = obj.url;
				const type = obj.type;

				let li = document.createElement('li');
				let a = document.createElement('a');

				li.textContent = "(" + type + ") ";
				a.textContent = url;
				a.href = url;

				li.appendChild(a);
				ol.appendChild(li);
			});

		});

	});

}).catch(onError);
