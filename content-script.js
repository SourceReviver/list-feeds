(function () {

	/**
	 * get alternate rel feeds
	 **/
	function getRelFeeds (url) {
		const feeds = [];
		const relLinks = document.querySelectorAll('link[rel*="alternate"]');
		relLinks.forEach((link) => {
			let href = link.getAttribute('href');
			let type = link.getAttribute('type');

			if (typeof href !== 'string' || typeof type !== 'string') {
				return;
			}
			href = href.trim();
			type = type.trim();

			switch (type) {
				case 'application/rss+xml': // rss
				case 'application/atom+xml': // atom
				case 'application/xml': // rss or atom
				case 'text/xml': // rss or atom
				case 'application/json': // jsonfeed
					if ( !href.startsWith('http') && !href.startsWith('//') ) {
						const feedUrl = new URL(href, url.origin + url.pathname);
						href = feedUrl.toString();
					}
					feeds.push(href);
					break
				default:
					break
			}
		});
		return feeds;
	}

	/**
	 *  
	 */
	function getYoutubeFeeds (url) {
		const feeds = [];
		if (url.host === 'www.youtube.com') {
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

	/**
	 * https://www.reddit.com/r/pathogendavid/comments/tv8m9/pathogendavids_guide_to_rss_and_reddit/
	 *
	 * */
	function getRedditFeeds (url) {
		const feeds = [];
		if (url.host === 'www.reddit.com' ) {
			let feedUrl;
			// main feed
			feedUrl = new URL('.rss', url.origin);
			feeds.push(feedUrl.toString());

			// show comment feed
			feedUrl = new URL('/comments/.rss', url.origin);
			feeds.push(feedUrl.toString());

			// show redditor feeds
			if (url.pathname.startsWith('/user/')) {
				const userId = url.pathname.split('/')[2];
				feedUrl = new URL('/user/' + userId + '/.rss', url.origin);
				feeds.push(feedUrl.toString());
				feedUrl = new URL('/user/' + userId + '/comments/.rss', url.origin);
				feeds.push(feedUrl.toString());
				feedUrl = new URL('/user/' + userId + '/submitted/.rss', url.origin);
				feeds.push(feedUrl.toString());
			}

			// show search feed
			if (url.pathname.startsWith('/search/') && url.searchParams.has('q')) {
				feedUrl = new URL('/search.rss', url.origin);
				feedUrl.searchParams.set('q', url.searchParams.get('q'));
				feeds.push(feedUrl.toString());
			}

			if (url.pathname.startsWith('/r/')) {
				const parts = url.pathname.split('/');
				if (parts.length > 1) {
					const subRedditName = parts[2];
					// show subreddits feed  http://www.reddit.com/r/``{SUBREDDIT_NAME}``/new/.rss
					feedUrl = new URL('/r/' + subRedditName + '/new/.rss', url.origin);
					feeds.push(feedUrl.toString());

					// show post feed  http://www.reddit.com/r/``{SUBREDDIT_NAME}``/comments/``{POST_ID}``/.rss
					if (url.pathname.indexOf('/comments/') > 0) {
						if (parts.length > 3) {
							const postId = parts[4];
							feedUrl = new URL('/r/' + subRedditName + '/comments/' + postId + '/.rss', url.origin);
							feeds.push(feedUrl.toString());
						}
					}
				}
			}
		}
		return feeds;
	}

	function getGithubFeeds(url) {
		const feeds = [];
		if(url.host === 'github.com') {
			let feedUrl;
			let user;
			let repo;
			const parts = url.pathname.split('/');
			if(parts.length > 1) { // user 
				user = parts[1];
				feedUrl = new URL(user + ".atom" , url.origin);
				feeds.push(feedUrl.toString());
			}
			if(parts.length > 2) {  // repo releases and tags
				repo = parts[2];
				feedUrl = new URL(user + "/" + repo + "/releases.atom" , url.origin);
				feeds.push(feedUrl.toString());
				feedUrl = new URL(user + "/" + repo + "/tags.atom" , url.origin);
				feeds.push(feedUrl.toString());
			}
		}
		return feeds;
	}

	/**
	 * https://de.wikipedia.org/wiki/Hilfe:Feeds
	 **/ 
	function getWikipedia(url) {
		const feeds = [];
		if(url.host.endsWith('wikipedia.org')) {
			let feedUrl;
			const parts = url.pathname.split('/');
			if(parts.length > 1) {
				const articleTitle = parts[parts.length-1];
				// https://de.wikipedia.org/w/index.php?title=Name_der_Seite&action=history&feed={atom|rss}
				feedUrl = new URL('/w/index.php?title=' + articleTitle + "&action=history&feed=atom",url.origin);	
				feeds.push(feedUrl.toString());
				feedUrl = new URL('/w/index.php?title=' + articleTitle + "&action=history&feed=rss",url.origin);	
				feeds.push(feedUrl.toString());
			}
		}
		return feeds;
	}


	function getFeeds() {
		let feeds = [];
		const url = new URL(window.location.href);
		feeds = feeds.concat(getRelFeeds(url));
		feeds = feeds.concat(getYoutubeFeeds(url));
		feeds = feeds.concat(getRedditFeeds(url));
		feeds = feeds.concat(getGithubFeeds(url));
		feeds = feeds.concat(getWikipedia(url));

		/**/
		// ADD MORE HERE
		/**/

		// filter duplicates 
		/**/
		return [ ...new Set(feeds)];
	}

	return getFeeds();
})();
