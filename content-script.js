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

	/**
	 * https://support.bitchute.com/content/converting-a-bitchute-channel-into-an-rss-feed?from_search=66055530
	 **/ 
	function getBitchute(url) {
		const feeds = [];
		if(url.host.endsWith('bitchute.com')) {
			let feedUrl;
			const parts = url.pathname.split('/');
			if(parts.length > 1) {
				if (parts[1] === 'channel') {
					const channelname_selector = '.owner > a:nth-child(1)';
					const channelname = document.querySelector(channelname_selector).innerText;
					if(channelname !== '') {
	 					// https://www.bitchute.com/feeds/rss/channel/CHANNELNAME
						feedUrl = new URL('/feeds/rss/channel/' + channelname ,url.origin);	
						feeds.push(feedUrl.toString());
					}
				}
			}
		}
		return feeds;
	}


	/**
	 *  htps://developer.vimeo.com/api/reference/users#get_feed
	 **/ 
	function getVimeo(url) {
		const feeds = [];
		if(url.host.endsWith('vimeo.com')) {
			let feedUrl;
			const parts = url.pathname.split('/');
			if(parts.length === 2) {
				const channelname = parts[1]; 
				// TODO: there might be a better way to determine if it is a real channel or some meta page, but the selectors dont seem very promising 
				if(!['','watch','create','upload','features','blog','for-hire','stock','ott','solutions','enterprise','partners','upgrade'].includes(channelname)) {
					// https://vimeo.com/<channel>/videos/rss
					feedUrl = new URL('/' + channelname + '/videos/rss' ,url.origin);	
					feeds.push(feedUrl.toString());
				}
			}
		}
		return feeds;
	}


	/**
	 * 
	 **/ 
	function getOdysee(url) {
		const feeds = [];
		// INOF: lbry.tv seems to be deprecated, but lets leave it for now
		if(url.host.endsWith('odysee.com') || url.host.endsWith('lbry.tv')) { 
			let feedUrl;
			const parts = url.pathname.split('/');
			if(parts.length > 1) {
				const channelname = parts[1]; 
				if(channelname.startsWith('@')) {
					if(channelname !== '') {
						feeds.push('https://lbryfeed.melroy.org/channel/odysee/' + channelname);
					}
				}
			}
		}
		return feeds;
	}


	/**
	 *  https://hiverrss.com
	 **/ 
	function getHive(url) {
		const feeds = [];
		if(url.host.endsWith('hive.blog') || url.host.endsWith('steemit.com')) {
			const parts = url.pathname.split('/');
			if(parts.length > 1) {
				if (parts[1][0] === '@') {
					const userId = parts[1];
					feeds.push('https://hiverss.com/' + userId + '/feed');
					feeds.push('https://hiverss.com/' + userId + '/blog');
					feeds.push('https://hiverss.com/' + userId + '/comments');
				}
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
		feeds = feeds.concat(getBitchute(url));
		feeds = feeds.concat(getVimeo(url));
		feeds = feeds.concat(getOdysee(url));
		feeds = feeds.concat(getHive(url));

		/**/
		// ADD MORE HERE
		/**/

		// filter duplicates 
		/**/
		return [ ...new Set(feeds)];
	}

	return getFeeds();
})();
