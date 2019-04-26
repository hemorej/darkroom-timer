<template>
  <div class="grid-container">
    <div class="grid-x grid-margin-x">
      <div class="cell medium-6 medium-offset-3 text-center">
        <h1>
          Online Darkroom Timer
        </h1>
      </div>
    </div>
    <form class="margin-top" @submit.prevent="startTimer">
      <div class="grid-x grid-margin-x">
        <div class="cell medium-2 medium-offset-2">
          <label for="development" class="text-right">Develop for</label>
        </div>

        <div class="cell medium-4">
          <input
            autofocus
            tabindex="1"
            type="number"
            placeholder="minutes"
            required
            min="1"
            pattern="[0-9]*"
            title="development time in minutes"
            v-model.number="development"
            @keyup.13="submit"
          />
        </div>
      </div>
      <div class="grid-x grid-margin-x">
        <div class="cell medium-2 medium-offset-2">
          <label for="inversion" class="text-right">Inversion every</label>
        </div>

        <div class="cell medium-4">
          <input
            tabindex="2"
            type="number"
            placeholder="minutes"
            min="0.5"
            pattern="[0-9]*"
            required
            step="0.5"
            title="how often to invert, in minutes"
            @keyup.13="submit"
            v-model.number="inversion"
          />
        </div>
      </div>
      <div class="grid-x grid-margin-x">
        <div class="cell medium-2 medium-offset-2">
          <label for="stop" class="text-right">Stop for</label>
        </div>

        <div class="cell medium-4">
          <input
            tabindex="3"
            type="number"
            placeholder="minutes"
            required
            min="1"
            pattern="[0-9]*"
            title="stop bath duration, in minutes"
            v-model.number="stop"
            @keyup.13="submit"
          />
        </div>
      </div>
      <div class="grid-x grid-margin-x">
        <div class="cell medium-2 medium-offset-2">
          <label for="fix" class="text-right">Fix for</label>
        </div>

        <div class="cell medium-4">
          <input
            tabindex="4"
            type="number"
            placeholder="minutes"
            required
            min="1"
            pattern="[0-9]*"
            title="fixing duration, in minutes"
            v-model.number="fix"
            @keyup.13="submit"
          />
        </div>
      </div>
      <div class="grid-x grid-margin-x">
        <div class="cell medium-2 medium-offset-2">
          <label for="wash" class="text-right">Wash for</label>
        </div>
        <div class="cell medium-4">
          <input
            tabindex="5"
            type="number"
            placeholder="minutes"
            required
            min="1"
            pattern="[0-9]*"
            title="wash duration, in minutes"
            v-model.number="wash"
            @keyup.13="submit"
          />
        </div>
      </div>

      <div class="grid-x grid-margin-x margin-top">
        <div class="cell medium-1 medium-offset-3">
          <button class="left secondary" @click="reset">
            Reset
          </button>
        </div>
        <div class="cell medium-4 medium-offset-1">
          <button tabindex="6" class="expanded primary">Go !</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      development: null,
      inversion: null,
      stop: null,
      fix: null,
      wash: null
    }
  },
  methods: {
    submit() {
      this.$refs.form.$el.submit()
    },
    startTimer() {
      localStorage.setItem('development', this.development * 60)
      localStorage.setItem('inversion', this.inversion * 60)
      localStorage.setItem('stop', this.stop * 60)
      localStorage.setItem('fix', this.fix * 60)
      localStorage.setItem('wash', this.wash * 60)
      this.$router.push({ name: 'timer' })
    },
    reset() {
      localStorage.clear()
    }
  }
}
</script>

<style>
.margin-top {
  margin-top: 3rem;
}
.secondary {
  padding: 0.85em 1em;
  background-color: #767676;
  color: #fefefe;
}
.warning {
  padding: 0.85em 1em;
  background-color: #ffae00;
  color: #0a0a0a;
}
</style>
