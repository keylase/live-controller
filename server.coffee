express    = require 'express'
app        = express()
bodyParser = require 'body-parser'
ATEM       = require 'applest-atem'
config     = require './config.json'
xkeys      = require '../node-xkeys/examples/set_all_backlights'
fs         = require 'fs'
isShiftedSource = false
isAuxInput = false
selectedAux = null
currentMixEffect = 0
states = [0,1]
_ = require 'underscore'
definedKeys = {}

layout = fs.readFileSync('atem.txt').toString('utf-8')

layoutArr = layout.split('\n');

layoutArr.forEach((line) ->
  if line.indexOf('//') > -1
    return

  keyIn = parseInt(line.split(':')[0])
  keyVal = parseInt(line.split(':')[1])
  if keyIn
    definedKeys[keyIn] = keyVal
  )

xkeys.setRedBackLight('me',currentMixEffect,1);

xkeys.realKeys().forEach( (key)->
   if ( key.class=='pgm' || key.class == 'prv')
     if definedKeys[key.index]
      key.realIndex = definedKeys[key.index]
     else
       key.realIndex = key.index
      console.log key
  )

xkeys.on 'pressed', (key) ->
  # console.log("ATEM: ", key);
  #console.log('isShiftedSource: ', isShiftedSource)

  if (key.class == 'aux')
    isAuxInput = !isAuxInput;
    selectedAux = key.index
    # return
  if (key.class == 'me')
    currentMixEffect = key.index
    xkeys.realKeys().forEach((key) ->
      if key.class=='me' && key.index != currentMixEffect
          xkeys.setRedBackLight('me',key.index,0);
      )
    # console.log 'currentMixEffect: ', currentMixEffect
    getCurrentState()
    if !isAuxInput
      xkeys.setRedBackLight('me',currentMixEffect,1);

  if (isShiftedSource == false && !isAuxInput)
    if key.type == 'auto'
      switchers[0].autoTransition(currentMixEffect)
    if key.type == 'cut'
      switchers[0].cutTransition(currentMixEffect)
    if key.class == 'pgm'
      switchers[0].changeProgramInput(key.realIndex, currentMixEffect)
    if key.class == 'prv'
      switchers[0].changePreviewInput(key.realIndex, currentMixEffect)
    if key.class == 'keyOn'
      val =  states[currentMixEffect].video.upstreamKeyState[key.index]
      switchers[0].changeUpstreamKeyState(key.index, !val, currentMixEffect)
    if key.class == 'dskCut'
      val =  states[0].video.downstreamKeyOn[key.index]
      switchers[0].changeDownstreamKeyOn(key.index, !val)
    if key.class == 'dskAuto'
      switchers[0].changeUpstreamKeyAuto(key.index)
    if key.class == 'dskTie'
      val =  states[0].video.downstreamKeyTie[key.index]
      switchers[0].changeDownstreamKeyTie(key.index, !val)




xkeys.on 'shifted', (keys) ->
  # console.log('KEYS:',keys)

  #KEY AND BKGND shifted
  if (keys.find((k) -> return (k.class == 'key' || k.class == 'bkgnd')))
    # console.log("SET KEYS IS SHIFTED", keys)
    unshiftedKeyKeys = xkeys.realKeys().filter((k) ->
      return (k.class == 'key' || k.class == 'bkgnd') && keys.indexOf(k) == -1)
    # console.log("SET unshiftedKeyKeys KEYS", unshiftedKeyKeys)

    unshiftedKeyKeys.forEach((key) ->
      if (key.class == 'key')
        switchers[0].changeUpstreamKeyNextState(key.index, 0, currentMixEffect)
      if (key.class == 'bkgnd')
        switchers[0].changeUpstreamKeyNextBackground(0, currentMixEffect)
      )
    keys.forEach((key)->
        if (key.class == 'key')
          switchers[0].changeUpstreamKeyNextState(key.index, 1, currentMixEffect)
        if (key.class == 'bkgnd')
          switchers[0].changeUpstreamKeyNextBackground(1, currentMixEffect)
      )

  #
  # if (key.class == 'key')
  #   val = states[currentMixEffect].video.upstreamKeyNextState[key.index]
  #   switchers[0].changeUpstreamKeyNextState(key.index, !val, currentMixEffect)
  # if (key.class == 'bkgnd')
  #   val = states[currentMixEffect].video.upstreamKeyNextState[key.index]
  #   switchers[0].changeUpstreamKeyNextState(key.index, !val, currentMixEffect)

  isShiftedSource = keys.filter((key)->
    return key.type == 'shiftSource'
    )
  isShiftedSource = isShiftedSource.length > 0
  if isShiftedSource
    offset = 8
  else
    offset = 0

  #AUX SELECTING
  if isAuxInput
    keys.forEach (key) ->
      if (key.class == 'pgm')
        findedKey = xkeys.realKeys().filter((k) ->
          return (k.class == key.class && k.index == key.index+offset))[0]
        switchers[0].changeAuxInput(selectedAux, key.realIndex)
      return


  #SHIFTED NUMBER SELECTING
  if !isAuxInput
    keys.forEach (key) ->
      if (key.class == 'pgm')
        findedKey = xkeys.realKeys().filter((k) ->
          return (k.class == key.class && k.index == key.index+offset))[0]
        switchers[0].changeProgramInput(findedKey.realIndex, currentMixEffect)
      if (key.class == 'prv')
        findedKey = xkeys.realKeys().filter((k) ->
          return (k.class == key.class && k.index == key.index+offset))[0]

        switchers[0].changePreviewInput(findedKey.realIndex, currentMixEffect)
      if key.class == 'player'
        if key.action == 'prev'
          offset = -1
        else
          offset = 1
        val  = states[0].video.mediaPlayer[key.index].stilIndex + offset
        if val < 0 then val=0
        # console.log(val)
        switchers[0].changeClipPlayer(key.index, val)
      if key.class == 'transition'
        if isShiftedSource
          offset = 1
        else
          offset = 0
        val = key['state_' + offset + '_val']
        switchers[0].changeTransitionType(val)






switchers = []
for switcher in config.switchers
  atem = new ATEM
  atem.event.setMaxListeners(5)

  # atem.on 'stateChanged', (err,state)->
  #   console.log 'stateChanged', state
  atem.connect(switcher.addr, switcher.port)
  switchers.push(atem)

app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/public'))

app.get('/api/channels', (req, res) ->
  res.send(JSON.stringify(config.channels))
)



for atem in switchers
  atem.on('stateChanged', (err, state) ->
    if state.video.mixEffect != undefined

      states[state.video.mixEffect] = JSON.parse(JSON.stringify(state))

      if state && state.video && state.video.auxs && state.video.auxs[0]
        auxs = state.video.auxs
        downstreamKeyOn = state.video.downstreamKeyOn
        downstreamKeyAuto = state.video.downstreamKeyAuto
        downstreamKeyTie = state.video.downstreamKeyTie
        mediaPlayer = state.video.mediaPlayer
        # console.log('AuxS: ', auxs)
        if states[0] && states[0].video
          states[0].video.auxs = JSON.parse(JSON.stringify(auxs))
          states[0].video.downstreamKeyOn = JSON.parse(JSON.stringify(downstreamKeyOn))
          states[0].video.downstreamKeyAuto = JSON.parse(JSON.stringify(downstreamKeyAuto))
          states[0].video.downstreamKeyTie = JSON.parse(JSON.stringify(downstreamKeyTie))
          states[0].video.mediaPlayer = JSON.parse(JSON.stringify(mediaPlayer))
        # if states[1] && states[1].video
        #   states[1].video.auxs = JSON.parse(JSON.stringify(auxs))
      #if state && state.video && state.video.upstreamKeyNextState

      # if state.video.mixEffect == 0
        # upstreamKeyNextState = state.video.upstreamKeyNextState
        # if states[0] && states[0].video
        #   states[0].video.upstreamKeyNextState = JSON.parse(JSON.stringify(upstreamKeyNextState))
        # if states[1] && states[1].video
        #   states[1].video.upstreamKeyNextState = JSON.parse(JSON.stringify(upstreamKeyNextState))




      # console.log state
      # console.log states[state.video.mixEffect]
      # getCurrentState()
    )

getCurrentState = () ->
  for atem in switchers

    curState = states[currentMixEffect]


    if isAuxInput == false
      if curState
        findedKeyPgmIndex = 0
        findedKeyPrvIndex = 0
        try
            findedKeyPgmIndex = xkeys.realKeys().filter((k) ->
              return (k.class == 'pgm' && k.realIndex == curState.video.programInput))[0].index
            findedKeyPrvIndex = xkeys.realKeys().filter((k) ->
              return (k.class == 'prv' && k.realIndex == curState.video.previewInput))[0].index
        catch e


        xkeys.realKeys().forEach((key)->
           if key.class == 'aux'
             xkeys.setRedBackLight('aux',key.index, 0)
           if key.class == 'pgm' && findedKeyPgmIndex != key.index
             xkeys.setRedBackLight('pgm',key.index,0);
           if key.class == 'prv' && findedKeyPrvIndex != key.index
             xkeys.setBlueBackLight('prv',key.index,0);
           if key.class == 'key'
             xkeys.setRedBackLight('key', key.index, curState.video.upstreamKeyNextState[key.index])
           if key.class == 'bkgnd'
             xkeys.setRedBackLight('bkgnd', key.index, curState.video.upstreamKeyNextBackground)
           if key.class == 'keyOn'
             xkeys.setRedBackLight('keyOn', key.index, curState.video.upstreamKeyState[key.index])
           if key.class == 'dskCut'
             xkeys.setRedBackLight('dskCut', key.index, states[0].video.downstreamKeyOn[key.index])
           if key.class == 'dskAuto'
              xkeys.setRedBackLight('dskAuto', key.index, states[0].video.downstreamKeyAuto[key.index])
           if key.class == 'dskTie'
              xkeys.setRedBackLight('dskTie', key.index, states[0].video.downstreamKeyTie[key.index])
           if key.class == 'transition'
              key.variants = [key.state_0_val, key.state_1_val]
              if (key.variants.indexOf(curState.video.transitionStyle) > -1)
                if (curState.video.transitionStyle % 2)
                  xkeys.setRedBackLight('transition', key.index, 0)
                  xkeys.setBlueBackLight('transition', key.index, 1)
                else
                  xkeys.setBlueBackLight('transition', key.index, 0)
                  xkeys.setRedBackLight('transition', key.index, 1)

              else
                xkeys.setRedBackLight('transition', key.index, 0)
                xkeys.setBlueBackLight('transition', key.index, 0)
          )




        xkeys.setRedBackLight('pgm',findedKeyPgmIndex,1);
        xkeys.setBlueBackLight('prv',findedKeyPrvIndex,1);
    else
      auxs = states[0].video.auxs;
      currentInput = auxs[selectedAux];
      # states.forEach((state)->
      #     console.log state.video.auxs
      #   )


      xkeys.realKeys().forEach((key)->
        if key.class == 'aux' && selectedAux == key.index #POWER UP AUX BACKLIGH
          xkeys.setRedBackLight('aux',key.index, 1)

        if key.class == 'pgm' && currentInput != key.index
          xkeys.setRedBackLight('pgm',key.index,0);
        #  if key.class == 'prv' && curState.video.previewInput != key.index
        xkeys.setBlueBackLight('prv',key.index,0);
      )
      xkeys.setRedBackLight('pgm',currentInput,1);


setInterval(() ->
  getCurrentState()
,100)

app.get('/api/switchersState', (req, res) ->
  res.send(JSON.stringify((atem.state for atem in switchers)))
)
#
# app.get('/api/switchersStatePolling', (req, res) ->
#   for atem in switchers
#     atem.once('stateChanged', (err, state) ->
#       res.end(JSON.stringify((atem.state for atem in switchers)))
#     )
# )

app.post('/api/changePreviewInput', (req, res) ->
  device = req.body.device
  input  = req.body.input
  switchers[device].changePreviewInput(input)
  res.send('success')
)

app.post('/api/changeProgramInput', (req, res) ->
  device = req.body.device
  input  = req.body.input
  switchers[device].changeProgramInput(input)
  res.send('success')
)

app.post('/api/autoTransition', (req, res) ->
  device = req.body.device
  switchers[device].autoTransition()
  res.send('success')
)

app.post('/api/cutTransition', (req, res) ->
  device = req.body.device
  switchers[device].cutTransition()
  res.send('success')
)

app.post('/api/changeTransitionPosition', (req, res) ->
  device   = req.body.device
  position = req.body.position
  switchers[device].changeTransitionPosition(position)
  res.send('success')
)

app.post('/api/changeTransitionType', (req, res) ->
  type = req.body.type
  for switcher in switchers
    switcher.changeTransitionType(type)
  res.send('success')
)

app.post('/api/changeUpstreamKeyState', (req, res) ->
  device = req.body.device
  number = req.body.number
  state  = req.body.state
  switchers[device].changeUpstreamKeyState(number, state)
  res.send('success')
)

app.post('/api/changeUpstreamKeyNextBackground', (req, res) ->
  device = req.body.device
  state  = req.body.state
  switchers[device].changeUpstreamKeyNextBackground(state)
  res.send('success')
)

app.post('/api/changeUpstreamKeyNextState', (req, res) ->
  device = req.body.device
  number = req.body.number
  state  = req.body.state
  switchers[device].changeUpstreamKeyNextState(number, state)
  res.send('success')
)

app.listen(8080)
