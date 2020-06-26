
const extId = "list-feeds";

function onError(e){console.log(`${extId}::onError: ${e}`);}

browser.tabs.executeScript({file: "content-script.js"}).then( () => {

	return browser.tabs.query({active: true, currentWindow: true}).then( (tabs) => {

		return browser.tabs.sendMessage(tabs[0].id, { cmd: extId,}).then( (urls) => {

			var ul = document.getElementById('feedlist');
			ul.textContent = '';
			urls.forEach( (url) => {

				var li = document.createElement('li');
				var a = document.createElement('a');
				var linkText = document.createTextNode(url);
				a.appendChild(linkText);
				a.href = url;
				li.appendChild(a);
				ul.appendChild(li);
			});

		});

	});

}).catch(onError);
