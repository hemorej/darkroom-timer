<template>
  <div class="mw6 center ph3-ns mt2 tc">
      <router-link class="black-30 hover-gold" to="/"><h1>Darkroom Timer</h1></router-link>
      <span class="black-40 f2 normal lh-title">{{ timeRemaining }}</span>
  </div>
  <fullscreen v-model:fullscreen="fullscreen">
    <div class="mw6 center ph3-ns mt2">
      <div class="cf ph2-ns">
        <div class="fl w-100">
          <div
            class="fl w-90-ns w-100 pa2 tc"
            :class="{
              'bg-gold': getReady == true,
              'bg-dark-red white': running == false,
            }"
          >
            <div class="mv2">
              <div v-show="getReady == true">invert tank...</div>
              <div v-show="running == false">timer is paused</div>
              <div
                class="bg-light-grey"
                v-show="running == true && getReady == false"
              >
              &nbsp;
              </div>
            </div>
          </div>
        </div>

        <div class="fl w-100">
          <div class="fl w-20-ns w-30 tl ph2">
            <button
                class="mt2 br2 ba ph3 pv2 mb2 dib bg-transparent link black-70 b--black-70 hover-white hover-bg-black-70"
                @click="reset">
              Reset
            </button>
          </div>

        <div class="fl w-20-ns dn db-ns tl">
          <button 
              class="mt2 br2 ba ph3 pv2 mb2 dib bg-transparent link black-70 b--black-70 hover-white hover-bg-black-70" 
              @click="fullscreenHandler">
            <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
          </button>
        </div>

        <div class="fl w-50-ns w-60 tr">
          <button 
            class="mt2 br2 ba ph5 pv2 mb2 dib bg-transparent link dark-red b--dark-red hover-white hover-bg-dark-red" 
            @click="pause">
            <span v-if="running == true">Pause</span>
            <span v-else>Resume</span>
          </button>
        </div>
      
        </div>
      </div>

      <div class="fl w-100 mt4">
        <div class="fl w-30-ns w-40 pa2">
          <h3 class="tr lh-copy f4 black-30">Development:</h3>
        </div>

        <div class="fl w-60-ns w-60 pr2 tr">
          <h1
            class="f2"
            :class="[ this.step == 'development' ? 'black' : 'black-20' ]"
          >
            {{ clockCountdown('development') }}
          </h1>
        </div>
      </div>

      <div class="fl w-100">
        <div class="fl w-30-ns w-40 pa2">
          <h3 class="tr lh-copy f4 black-30">Stopping:</h3>
        </div>

        <div class="fl w-60-ns w-60 pr2 tr">
          <h1
            class="f2"
            :class="[ this.step == 'stop' ? 'black' : 'black-20' ]"
          >
            {{ clockCountdown('stop') }}
          </h1>
        </div>
      </div>

      <div class="fl w-100">
        <div class="fl w-30-ns w-40 pa2">
          <h3 class="tr lh-copy f4 black-30">Fixing:</h3>
        </div>

        <div class="fl w-60-ns w-60 pr2 tr">
          <h1
            class="f2"
            :class="[ this.step == 'fix' ? 'black' : 'black-20' ]"
          >
            {{ clockCountdown('fix') }}
          </h1>
        </div>
      </div>

      <div class="fl w-100">
        <div class="fl w-30-ns w-40 pa2">
          <h3 class="tr lh-copy f4 black-30">Washing:</h3>
        </div>

        <div class="fl w-60-ns w-60 pr2 tr">
          <h1
            class="f2"
            :class="[ this.step == 'wash' ? 'black' : 'black-20' ]"
          >
            {{ clockCountdown('wash') }}
          </h1>
        </div>
      </div>
    </div>
  </fullscreen>
</template>

<script>
  Number.prototype.pad = function (size) {
    var s = String(this)
    while (s.length < (size || 2)) {
      s = '0' + s
    }
    return s
  }

  export default {
    name: 'timer-view',
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
        development: parseInt(localStorage.development) || 0,
        inversion: parseInt(localStorage.inversion) || 0,
        stop: parseInt(localStorage.stop) || 0,
        fix: parseInt(localStorage.fix) || 0,
        wash: parseInt(localStorage.wash) || 0,
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
      },
    },
    methods: {
      clockCountdown: function (step) {
        var localCounter = this.steps[step]

        return (
          Math.floor(localCounter / 60).pad() + ':' + (localCounter % 60).pad()
        )
      },
      pause() {
        this.running = !this.running
        
        if(this.getReady == true)
          this.getReady = !this.getReady
      },
      reset() {
        localStorage.removeItem('development')
        localStorage.removeItem('inversion')
        localStorage.removeItem('stop')
        localStorage.removeItem('fix')
        localStorage.removeItem('wash')
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
      fullscreenHandler(){
        this.fullscreen = !this.fullscreen
      },
    },
    created() {
      this.steps = {
        development: this.development,
        stop: this.stop,
        fix: this.fix,
        wash: this.wash,
      }

      if (this.development != 0) {
        this.counter = window.setInterval(this.timer, 1000)
        this.alertTimer = setTimeout(this.clear, 30000) // first 30 sec
      } else {
        this.getReady = false
      }
    },
  }
</script>

<style>
</style>
