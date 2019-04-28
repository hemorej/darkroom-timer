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
        <div class="cell small-4 medium-2 medium-offset-2">
          <label for="development" class="medium-text-right">Develop for</label>
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
        <div class="cell small-4 medium-2 medium-offset-2">
          <label for="inversion" class="medium-text-right"
            >Inversion every</label
          >
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
        <div class="cell small-4 medium-2 medium-offset-2">
          <label for="stop" class="medium-text-right">Stop for</label>
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
        <div class="cell small-4 medium-2 medium-offset-2">
          <label for="fix" class="medium-text-right">Fix for</label>
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
        <div class="cell small-4 medium-2 medium-offset-2">
          <label for="wash" class="medium-text-right">Wash for</label>
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
        <div class="cell small-3 medium-1 medium-offset-3">
          <button class="hollow button left warning" @click.prevent="reset">
            Reset
          </button>
        </div>
        <div class="cell small-3 medium-1">
          <button
            :class="[{ disabled: !canSave }, 'button hollow left']"
            @click.prevent="prompt"
          >
            Save
          </button>
        </div>
        <div class="cell small-3 medium-1">
          <button
            v-show="hasSavedTimes"
            class="hollow button left"
            @click="savedTimes"
          >
            Times
          </button>
        </div>
        <div class="cell small-3 medium-4">
          <button tabindex="6" class="expanded primary">Go !</button>
        </div>
      </div>
    </form>
    <modal
      :name="recipeName"
      :temperature="temperature"
      :developer="developer"
      v-if="showModal"
      @close="showModal = false"
      @save="saveTime"
    >
      <h3 slot="header">New time</h3>
      <div slot="body">
        <input type="text" v-model="recipeName" placeholder="name" />
        <input type="number" v-model="temperature" placeholder="temperature" />
        <input type="text" v-model="developer" placeholder="developer" />
      </div>
      <div slot="footer">
        Development time: {{ this.development }}min <br />
        Agitation: once every {{ this.inversion }}min <br />
      </div>
    </modal>
  </div>
</template>

<script>
import modal from './Modal.vue'

export default {
  data() {
    return {
      development: null,
      inversion: null,
      stop: null,
      fix: null,
      wash: null,
      showModal: false,
      recipeName: null,
      developer: null,
      temperature: null
    }
  },
  components: {
    modal
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
      this.development = null
      this.inversion = null
      this.stop = null
      this.fix = null
      this.wash = null

      localStorage.removeItem('development')
      localStorage.removeItem('inversion')
      localStorage.removeItem('stop')
      localStorage.removeItem('fix')
      localStorage.removeItem('wash')
    },
    saveTime() {
      var recipes = localStorage.getItem('recipes')
      if (recipes === JSON.stringify({})) {
        recipes = [this.recipeName]
      } else {
        recipes = JSON.parse(recipes)
        if (recipes.indexOf(this.recipeName) < 0) recipes.push(this.recipeName)
      }
      localStorage.setItem('recipes', JSON.stringify(recipes))
      localStorage.setItem(
        this.recipeName,
        JSON.stringify({
          development: this.development,
          fix: this.fix,
          inversion: this.inversion,
          stop: this.stop,
          wash: this.wash,
          developer: this.developer,
          temperature: this.temperature
        })
      )
      this.showModal = false
      this.$router.push({ name: 'times' })
    },
    prompt() {
      this.showModal = true
    },
    savedTimes() {
      this.$router.push({ name: 'times' })
    }
  },
  computed: {
    hasSavedTimes() {
      var recipes = localStorage.getItem('recipes')
      return recipes !== JSON.stringify([])
    },
    canSave() {
      return (
        this.development != null &&
        this.inversion != null &&
        this.stop != null &&
        this.fix != null &&
        this.wash != null &&
        this.development != 0 &&
        this.inversion != 0 &&
        this.stop != 0 &&
        this.fix != 0 &&
        this.wash != 0
      )
    }
  },
  created() {
    if (JSON.parse(localStorage.getItem('recipes')) == null)
      localStorage.setItem('recipes', JSON.stringify([]))
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
