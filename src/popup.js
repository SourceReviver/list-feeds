
const extId = 'list-feeds'

function onError (e) { console.log(`${extId}::onError: ${e}`) }

browser.tabs.executeScript({ file: 'content-script.js' }).then(() => {
  return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    return browser.tabs.sendMessage(tabs[0].id, { cmd: extId }).then((objs) => {
      const tbl = document.getElementById('feedlist')

      //
      tbl.textContent = objs.length + ' Feeds found'
      if (objs.length < 1) { return }
      if (objs.length === 1) {
        tbl.textContent = '1 Feed found'
      } else {
        objs.sort((a, b) => {
          if (a.url > b.url) { return 1 }
          if (b.url > a.url) { return -1 }
          return 0
        }
        )
      }

      //
      let idCounter = 1
      objs.forEach((obj) => {
        const url = obj.url
        const type = obj.type

        const tr = tbl.insertRow()

        const a = document.createElement('a')

        a.textContent = url
        a.href = url

        var td1 = tr.insertCell()
        td1.textContent = idCounter + '. '
        td1.appendChild(a)
        idCounter++

        var td2 = tr.insertCell()
        td2.textContent = type
      })
    })
  })
}).catch(onError)
