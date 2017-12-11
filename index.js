var h = require('hyperscript')
var pull = require('pull-stream')
var mime = require('simple-mime')('application/octect-stream')

exports.gives = {
  compose: {
    insert: true
  }
}

exports.needs = {
  sbot: {
    blobs: { add: 'first', push: 'first' }
  }
}

exports.create = function (api) {
  return { compose: { insert: function (ta, meta, context) {
    if(meta.recps) return //disabled on private threads, currently.

    return h('input', {type: 'file', onchange: function (ev) {
      var file = ev.target.files[0]
      if (!file) return
      var reader = new FileReader()
      reader.onload = function () {
        pull(
          pull.values([new Buffer(reader.result)]),
          api.sbot.blobs.add(function (err, id) {
            if(err) return console.error(err)
            ;(meta.mentions = meta.mentions || []).push({
              link: id,
              name: file.name,
              size: reader.result.length || reader.result.byteLength,
              type: mime(file.name)
            })

            ta.value = ta.value +
              (/image/.test(file.type) ? '!' : '') +
              '['+file.name+']('+id+')\n'

            api.sbot.blobs.push(id, function () {})
          })
        )
      }
      reader.readAsArrayBuffer(file)
    }})

  }}}
}



