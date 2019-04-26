<template>
  <fullscreen :background="'#dcdcdc'" :fullscreen.sync="fullscreen">
    <div
      class="grid-container"
      v-shortkey.once="{ space: ['space'], esc: ['esc'], f: ['f'] }"
      @shortkey="kbHandler"
    >
      <div class="grid-x grid-margin-x">
        <div class="cell medium-6 medium-offset-3 text-center">
          <h1>
            Online Darkroom Timer
            <span class="subheader">{{ timeRemaining }}</span>
          </h1>
        </div>
      </div>
      <div class="grid-x grid-margin-x">
        <div
          class="cell medium-6 medium-offset-3 text-center"
          :class="{
            'warning callout': getReady == true,
            'primary callout': running == false
          }"
        >
          <div class="subheader">
            <div v-show="getReady == true">invert tank...</div>
            <div v-show="running == false">timer is paused</div>
            <div
              class="blank callout"
              v-show="running == true && getReady == false"
            >
              blank
            </div>
          </div>
        </div>
      </div>
      <div class="grid-x grid-margin-x">
        <div class="cell medium-1 medium-offset-3">
          <button class="left black" @click="reset">
            Reset
          </button>
        </div>
        <div class="cell medium-4 medium-offset-1">
          <button class="expanded secondary" @click="pause">
            <span v-if="running == true">Pause</span>
            <span v-else>Resume</span>
          </button>
        </div>
      </div>

      <div class="grid-x grid-margin-x margin-top">
        <div class="cell medium-3 medium-offset-1">
          <h3 class="subheader medium-text-right">Development:</h3>
        </div>

        <div class="cell medium-5">
          <h1
            :class="[
              this.step == 'development' ? 'current' : 'subheader',
              'small-text-right'
            ]"
          >
            {{ clockCountdown('development') }}
          </h1>
        </div>
      </div>

      <div class="grid-x grid-margin-x">
        <div class="cell medium-3 medium-offset-1">
          <h3 class="subheader medium-text-right">Stopping:</h3>
        </div>

        <div class="cell medium-5">
          <h1
            :class="[
              this.step == 'stop' ? 'current' : 'subheader',
              'small-text-right'
            ]"
          >
            {{ clockCountdown('stop') }}
          </h1>
        </div>
      </div>

      <div class="grid-x grid-margin-x">
        <div class="cell medium-3 medium-offset-1">
          <h3 class="subheader medium-text-right">Fixing:</h3>
        </div>

        <div class="cell medium-5">
          <h1
            :class="[
              this.step == 'fix' ? 'current' : 'subheader',
              'small-text-right'
            ]"
          >
            {{ clockCountdown('fix') }}
          </h1>
        </div>
      </div>

      <div class="grid-x grid-margin-x">
        <div class="cell medium-3 medium-offset-1">
          <h3 class="subheader medium-text-right">Washing:</h3>
        </div>

        <div class="cell medium-5">
          <h1
            :class="[
              this.step == 'wash' ? 'current' : 'subheader',
              'small-text-right'
            ]"
          >
            {{ clockCountdown('wash') }}
          </h1>
        </div>
      </div>
    </div>
  </fullscreen>
</template>

<script>
Number.prototype.pad = function(size) {
  var s = String(this)
  while (s.length < (size || 2)) {
    s = '0' + s
  }
  return s
}

export default {
  name: 'timer',
  data() {
    return {
      getReady: true,
      steps: new Array(),
      step: null,
      stepNumber: 0,
      running: true,
      counter: null,
      alertTimer: null,
      fullscreen: false,
      development: parseInt(localStorage.getItem('development')),
      inversion: parseInt(localStorage.getItem('inversion')),
      stop: parseInt(localStorage.getItem('stop')),
      fix: parseInt(localStorage.getItem('fix')),
      wash: parseInt(localStorage.getItem('wash'))
    }
  },
  computed: {
    timeRemaining() {
      return (
        Math.floor(this.totalTime / 60).pad() +
        ':' +
        (this.totalTime % 60).pad()
      )
    },
    totalTime() {
      return (
        this.steps['development'] +
        this.steps['fix'] +
        this.steps['stop'] +
        this.steps['wash']
      )
    }
  },
  methods: {
    clockCountdown: function(step) {
      var localCounter = this.steps[step]

      return (
        Math.floor(localCounter / 60).pad() + ':' + (localCounter % 60).pad()
      )
    },
    pause() {
      this.running = !this.running
    },
    reset() {
      localStorage.clear()
      this.$router.push({ name: 'setup' })
    },
    timer() {
      if (this.totalTime == 0 || this.running == false) {
        return
      }

      if (this.step == null) {
        this.step = Object.keys(this.steps)[this.stepNumber]
      }

      this.steps[this.step] -= 1

      if (this.steps[this.step] == 0) {
        clearInterval(this.counter)
        this.stepNumber += 1
        this.steps[this.step] = 0

        this.step = Object.keys(this.steps)[this.stepNumber]

        this.counter = window.setInterval(this.timer, 1000)
        this.running = false

        return
      }

      if (
        this.steps[this.step] % this.inversion == 0 &&
        (this.step == 'development' || this.step == 'fix')
      ) {
        // should I prepare the next timer ?
        if (
          this.steps[this.step] != 0 &&
          this.development - this.steps[this.step] > 59
        ) {
          this.getReady = true
          this.alertTimer = window.setTimeout(this.clear, 5000)
        }
      }
    },
    clear() {
      clearTimeout(this.alertTimer)
      this.getReady = false
    },
    kbHandler(event) {
      switch (event.srcKey) {
        case 'space':
          return this.pause()
        case 'esc':
          return this.reset()
        case 'f':
          this.fullscreen = !this.fullscreen
      }
    }
  },
  created() {
    this.steps = {
      development: this.development,
      stop: this.stop,
      fix: this.fix,
      wash: this.wash
    }

    this.counter = window.setInterval(this.timer, 1000)
    this.alertTimer = setTimeout(this.clear, 30000) // first 30 sec
  }
}
</script>

<style>
.warning.callout {
  background-color: #f08a24 !important;
}
.primary.callout {
  background-color: #2ba6cb !important;
}
.blank.callout {
  background-color: #dcdcdc !important;
  color: #dcdcdc !important;
  border: none;
}
.callout > .subheader {
  color: #fff !important;
}
</style>
