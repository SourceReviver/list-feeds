(function () {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.listfeeds_hasRun) { return }
  window.listfeeds_hasRun = true

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    return Promise.resolve(getFeeds())
  })

  /**
   * General entrypoint to collect all feeds
   */
  function getFeeds () {
    let feeds = []
    const url = new URL(window.location.href)
    feeds = feeds.concat(getRelFeeds(url))
    feeds = feeds.concat(getYoutubeFeeds(url))
    feeds = feeds.concat(getRedditFeeds(url))
    feeds = feeds.concat(get9gagFeeds(url))
    return feeds
  }

  /**
   * get alternate rel feeds
   **/
  function getRelFeeds (url) {
    const urls = new Set()
    const feeds = []
    const relLinks = document.querySelectorAll('link[rel*="alternate"]')
    relLinks.forEach((link) => {
      let href = link.getAttribute('href')
      let type = link.getAttribute('type')

      if (typeof href !== 'string' || typeof type !== 'string') {
        return
      }
      href = href.trim()
      type = type.trim()

      switch (type) {
        case 'application/rss+xml': // rss
        case 'application/atom+xml': // atom
        case 'application/xml': // rss or atom
        case 'text/xml': // rss or atom
        case 'application/json': // jsonfeed
          if ( !href.startsWith('http') && !href.startsWith('//') ) {
            const feedUrl = new URL(href, url.origin + url.pathname)
            href = feedUrl.toString()
          }
          /**/
          if (!urls.has(href)) {
            feeds.push({ url: href, type: type })
            urls.add(href)
          }
          /**/
          break
        default:
          break
      }
    })
    return feeds
  }

  /**
   * get youtube feeds
   */
  function getYoutubeFeeds (url) {
    const feeds = []
    if (url.host === 'www.youtube.com') {
      const type = 'application/atom+xml'
      const feedUrl = new URL('/feeds/videos.xml', url.origin)
      if (url.pathname.startsWith('/user/')) {
        const userId = url.pathname.split('/')[2]
        feedUrl.searchParams.set('user', userId)
        feeds.push({ url: feedUrl.toString(), type: type })
      } else if (url.pathname.startsWith('/channel/')) {
        const channelId = url.pathname.split('/')[2]
        feedUrl.searchParams.set('channel_id', channelId)
        feeds.push({ url: feedUrl.toString(), type: type })
      } else if (url.searchParams.has('list')) {
        feedUrl.searchParams.set('playlist_id', url.searchParams.get('list'))
        feeds.push({ url: feedUrl.toString(), type: type })
      }
    }
    return feeds
  }

  /**
   * https://www.reddit.com/r/pathogendavid/comments/tv8m9/pathogendavids_guide_to_rss_and_reddit/
   *
   * */
  function getRedditFeeds (url) {
    const feeds = []
    if (url.host === 'www.reddit.com') {
      let feedUrl
      const type = 'application/atom+xml'
      // main feed
      feedUrl = new URL('.rss', url.origin)
      feeds.push({ url: feedUrl.toString(), type: type })

      // show comment feed
      feedUrl = new URL('/comments/.rss', url.origin)
      feeds.push({ url: feedUrl.toString(), type: type })

      // show redditor feeds
      if (url.pathname.startsWith('/user/')) {
        const userId = url.pathname.split('/')[2]
        feedUrl = new URL('/user/' + userId + '/.rss', url.origin)
        feeds.push({ url: feedUrl.toString(), type: type })
        feedUrl = new URL('/user/' + userId + '/comments/.rss', url.origin)
        feeds.push({ url: feedUrl.toString(), type: type })
        feedUrl = new URL('/user/' + userId + '/submitted/.rss', url.origin)
        feeds.push({ url: feedUrl.toString(), type: type })
      }

      // show search feed
      if (url.pathname.startsWith('/search/') && url.searchParams.has('q')) {
        feedUrl = new URL('/search.rss', url.origin)
        feedUrl.searchParams.set('q', url.searchParams.get('q'))
        feeds.push({ url: feedUrl.toString(), type: type })
      }

      if (url.pathname.startsWith('/r/')) {
        const parts = url.pathname.split('/')
        if (parts.length > 1) {
          const subRedditName = parts[2]
          // show subreddits feed  http://www.reddit.com/r/``{SUBREDDIT_NAME}``/new/.rss
          feedUrl = new URL('/r/' + subRedditName + '/new/.rss', url.origin)
          feeds.push({ url: feedUrl.toString(), type: type })

          // show post feed  http://www.reddit.com/r/``{SUBREDDIT_NAME}``/comments/``{POST_ID}``/.rss
          if (url.pathname.indexOf('/comments/') > 0) {
            if (parts.length > 3) {
              const postId = parts[4]
              feedUrl = new URL('/r/' + subRedditName + '/comments/' + postId + '/.rss', url.origin)
              feeds.push({ url: feedUrl.toString(), type: type })
            }
          }
        }
      }
    }
    return feeds
  }

  /**
   * https://9gag-rss.com/
   * todo: post, comment and user feeds
   */
  function get9gagFeeds (url) {
    const feeds = []
    if (url.host === '9gag.com') {
      const baseurl = 'https://9gagrss.xyz/rss.php?channel='
      const type = 'application/atom+xml'
      const parts = url.pathname.split('/')

      let found_channel = false

      if (parts.length > 1) {
        let channel = parts[1]
        if(typeof channel === 'string'){
          channel = channel.trim()
          if(channel.trim() !== ''){
            feeds.push({ url: baseurl + channel , type: type })
            found_channel=true;
          }
        }
      } 
      if(!found_channel) {
        // 9gagrss has no trending ... booh
        feeds.push({ url: 'https://9gag-rss.com/api/rss/get?code=9GAG&format=1', type: type })
      }

    }
    return feeds
  }
})()
