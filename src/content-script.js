(function() {
	/**
	 * Check and set a global guard variable.
	 * If this content script is injected into the same page again,
	 * it will do nothing next time.
	 */
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	function getYoutubeFeeds(url) {
		let feeds = [];
		if( url.host === 'www.youtube.com' ) {
			const feedUrl = new URL('/feeds/videos.xml', url.origin);
			if (url.pathname.startsWith('/user/')) {
				const userId = url.pathname.split('/')[2];
				feedUrl.searchParams.set('user', userId);
				feeds.push(feedUrl.toString());
			} else if (url.pathname.startsWith('/channel/')) {
				const channelId = url.pathname.split('/')[2];
				feedUrl.searchParams.set('channel_id', channelId);
				feeds.push(feedUrl.toString());
			} else if (url.searchParams.has('list')) {
				feedUrl.searchParams.set('playlist_id', url.searchParams.get('list'));
				feeds.push(feedUrl.toString());
			}
		}
		return feeds;
	}

	function getRelFeeds(url) {

		let feeds = [];
		const rel_links = document.querySelectorAll('link[rel*="alternate"]');
		rel_links.forEach( (link) => {
			const type= link.getAttribute('type');
			const href= link.getAttribute('href');
			switch(type){
				case 'application/xml':
				case 'application/rss+xml':
				case 'application/atom+xml':
				case 'application/xml':
				case 'text/xml':
					if(href.startsWith('/')) {
						const feedUrl = new URL(href, url.origin);
						feeds.push(feedUrl.toString());	
					}else{
						feeds.push(href);
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
		let feed_urls = [];
		const url = new URL(window.location.href);
		feed_urls = feed_urls.concat(getYoutubeFeeds(url));
		feed_urls = feed_urls.concat(getRelFeeds(url));
		return feed_urls;
	}

	/**
	 * Listen for messages from the background script.
	 * Call "beastify()" or "reset()".
	 */
	browser.runtime.onMessage.addListener((message) => {
		return Promise.resolve(getFeeds());
	});


})();
