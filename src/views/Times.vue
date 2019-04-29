<template>
  <div class="grid-container">
    <div class="grid-x grid-margin-x">
      <div class="cell medium-6 medium-offset-3 text-center">
        <h1>
          Online Darkroom Timer
        </h1>
      </div>
    </div>
    <div class="grid-x grid-margin-x margin-top">
      <div class="cell medium-6 medium-offset-3 text-center">
        <h4 class="subheader">Saved Times</h4>
      </div>
    </div>
    <div class="grid-x grid-margin-x margin-top">
      <div class="cell medium-6 medium-offset-3 text-left margin-top">
        <ul>
          <li v-for="(name, index) in savedTimes" :key="index">
            <h6 class="subheader">{{ name }}</h6>
            {{ recipe(name).development }}min at {{ recipe(name).temperature }}º
            in {{ recipe(name).developer }} &nbsp; &nbsp;
            <a href="#" @click.prevent="remove(index, name)">delete</a> &nbsp;
            <a href="#" @click.prevent="start(name)">start</a> &nbsp;
          </li>
          <li class="margin-top"><router-link to="/">home</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'times',
  data() {
    return {
      savedTimes: JSON.parse(localStorage.recipes)
    }
  },
  methods: {
    recipe(name) {
      return JSON.parse(localStorage.getItem(name))
    },
    remove(index, name) {
      var answer = confirm('Delete ' + name + ' ?')
      if (answer == true) {
        this.savedTimes.splice(index, 1)

        if (_.isEmpty(this.savedTimes)) {
          localStorage.clear()
          this.$router.push({ name: 'setup' })
        } else {
          localStorage.removeItem(name)
          localStorage.recipes = JSON.stringify(this.savedTimes)
        }
      }
    },
    start(name) {
      localStorage.development = this.recipe(name).development * 60
      localStorage.inversion = this.recipe(name).inversion * 60
      localStorage.stop = this.recipe(name).stop * 60
      localStorage.fix = this.recipe(name).fix * 60
      localStorage.wash = this.recipe(name).wash * 60

      this.$router.push({ name: 'timer' })
    }
  },
  computed: {}
}
</script>

<style>
ul li {
  list-style-type: '*   ';
}
</style>
