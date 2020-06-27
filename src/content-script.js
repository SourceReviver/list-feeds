(function() {
	/**
	 * Check and set a global guard variable.
	 * If this content script is injected into the same page again,
	 * it will do nothing next time.
	 */
	if (window.hasRun) { return; }
	window.hasRun = true;

	function getYoutubeFeeds(url) {
		let feeds = [];
		const type = "application/xml+atom";
		if( url.host === 'www.youtube.com' ) {
			const feedUrl = new URL('/feeds/videos.xml', url.origin);
			if (url.pathname.startsWith('/user/')) {
				const userId = url.pathname.split('/')[2];
				feedUrl.searchParams.set('user', userId);
				feeds.push({"url": feedUrl.toString(), "type": type});
			} else if (url.pathname.startsWith('/channel/')) {
				const channelId = url.pathname.split('/')[2];
				feedUrl.searchParams.set('channel_id', channelId);
				feeds.push({"url": feedUrl.toString(), "type": type});
			} else if (url.searchParams.has('list')) {
				feedUrl.searchParams.set('playlist_id', url.searchParams.get('list'));
				feeds.push({"url": feedUrl.toString(), "type": type});
			}
		}
		return feeds;
	}

	function getRelFeeds(url) {
		let urls = new Set();
		let feeds = [];
		const rel_links = document.querySelectorAll('link[rel*="alternate"]');
		rel_links.forEach( (link) => {
			let href= link.getAttribute('href').trim();
			const type= link.getAttribute('type').trim();

			switch(type){
				case 'application/rss+xml':  // rss https://www.rssboard.org/rss-mime-type-application.txt
				case 'application/atom+xml': // atom  
				case 'application/xml':  // either rss or atom 
				case 'text/xml':        // either rss or atom 
				case 'application/json': // json Feeds https://jsonfeed.org/ 
					if(href.startsWith('/')) {
						const feedUrl = new URL(href, url.origin);
						href = feedUrl.toString();
					}
					/**/
					//console.log(href);
					if( ! urls.has(href) ) {
						feeds.push({"url": href, "type": type});
						urls.add(href);
					}
					/**/
					break;
				default:
					break;

			}
		});
		return feeds;
	}

	function getFeeds() {
		let feeds = [];
		const url = new URL(window.location.href);
		feeds = feeds.concat(getYoutubeFeeds(url));
		feeds = feeds.concat(getRelFeeds(url));
		return feeds;
	}

	/**
	 * Listen for messages from the background script.
	 */
	browser.runtime.onMessage.addListener((message) => {
		return Promise.resolve(getFeeds());
	});


})();
