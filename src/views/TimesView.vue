<template>
  <div class="mw6 center ph3-ns mt2 tc">
    <router-link class="black-30 hover-gold" to="/"
      ><h1>Darkroom Timer</h1></router-link
    >
  </div>

  <div class="mw6 center ph3-ns gray lh-copy f3 tc">Saved Times</div>

  <div class="mw7 center ph3-ns mt6">
    <div class="cf ph2-ns">
      <div class="fl w-100">
        <div class="fl w-80-ns pa2">
          <ul>
            <li v-for="(name, index) in savedTimes" :key="index">
              <span class="lh-copy f4 normal mr4">{{ name }}</span>
              {{ recipe(name).development }}min at
              {{ recipe(name).temperature }}º in
              {{ recipe(name).developer }} &nbsp; &nbsp;
              <a
                class="black-30 hover-gold"
                href="#"
                @click.prevent="remove(index, name)"
                >delete</a
              >
              &nbsp;
              <a
                class="black-30 hover-gold"
                href="#"
                @click.prevent="start(name)"
                >start</a
              >
              &nbsp;
            </li>
            <li>
              <span class="lh-copy f4 normal"
                ><router-link class="black-30 hover-gold" to="/"
                  >home</router-link
                ></span
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lodash from "lodash";

export default {
  name: "times-view",
  data() {
    return {
      savedTimes: JSON.parse(localStorage.recipes),
    };
  },
  methods: {
    recipe(name) {
      return JSON.parse(localStorage.getItem(name));
    },
    remove(index, name) {
      var answer = confirm("Delete " + name + " ?");
      if (answer == true) {
        this.savedTimes.splice(index, 1);

        if (lodash.isEmpty(this.savedTimes)) {
          localStorage.clear();
          this.$router.push({ name: "setup" });
        } else {
          localStorage.removeItem(name);
          localStorage.recipes = JSON.stringify(this.savedTimes);
        }
      }
    },
    start(name) {
      localStorage.development = this.recipe(name).development * 60;
      localStorage.inversion = this.recipe(name).inversion * 60;
      localStorage.stop = this.recipe(name).stop * 60;
      localStorage.fix = this.recipe(name).fix * 60;
      localStorage.wash = this.recipe(name).wash * 60;

      this.$router.push({ name: "timer" });
    },
  },
};
</script>

<style>
ul li {
  list-style-type: "*   ";
}
</style>
