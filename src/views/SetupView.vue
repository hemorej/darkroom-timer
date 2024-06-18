<template>
  <div class="mw6 center ph3-ns mt2 tc">
    <h1>Darkroom Timer</h1>
  </div>

  <div class="mw7 center ph3-ns mt5">
    <div class="cf ph2-ns">
      <form @submit.prevent="startTimer">
        <div class="fl w-100">
          <div class="fl w-20-ns w-100 pa2 tr-ns">
            <label for="development">Develop for</label>
          </div>

          <div class="fl w-50-ns w-100 pa2 tl">
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
              @keyup.enter="submit"
            />
          </div>
        </div>

        <div class="fl w-100">
          <div class="fl w-20-ns pa2 tr-ns w-100">
            <label for="inversion">Inversion every</label>
          </div>

          <div class="fl w-50-ns pa2 tl w-100">
            <input
              tabindex="2"
              type="number"
              placeholder="minutes"
              min="0.5"
              pattern="[0-9]*"
              required
              step="0.5"
              title="how often to invert, in minutes"
              @keyup.enter="submit"
              v-model.number="inversion"
            />
          </div>
        </div>

        <div class="fl w-100">
          <div class="fl w-20-ns pa2 tr-ns w-100">
            <label for="stop">Stop for</label>
          </div>

          <div class="fl w-50-ns pa2 tl w-100">
            <input
              tabindex="3"
              type="number"
              placeholder="minutes"
              required
              min="1"
              pattern="[0-9]*"
              title="stop bath duration, in minutes"
              v-model.number="stop"
              @keyup.enter="submit"
            />
          </div>
        </div>

        <div class="fl w-100">
          <div class="fl w-20-ns pa2 tr-ns w-100">
            <label for="fix">Fix for</label>
          </div>

          <div class="fl w-50-ns pa2 tl w-100">
            <input
              tabindex="4"
              type="number"
              placeholder="minutes"
              required
              min="1"
              pattern="[0-9]*"
              title="fixing duration, in minutes"
              v-model.number="fix"
              @keyup.enter="submit"
            />
          </div>
        </div>

        <div class="fl w-100">
          <div class="fl w-20-ns pa2 tr-ns w-100">
            <label for="wash">Wash for</label>
          </div>

          <div class="fl w-50-ns pa2 tl w-100">
            <input
              tabindex="5"
              type="number"
              placeholder="minutes"
              required
              min="1"
              pattern="[0-9]*"
              title="wash duration, in minutes"
              v-model.number="wash"
              @keyup.enter="submit"
            />
          </div>
        </div>

        <div class="fl w-100 mt4 ph2">
          <div class="fl w-10-ns w-third tl">
            <button
              class="link br2 ba ph3 pv2 mb2 dib bg-transparent gold b--gold hover-black hover-bg-gold"
              @click.prevent="reset"
            >
              Reset
            </button>
          </div>
          <div class="fl w-10-ns w-third tl">
            <button
              class="br2 ba ph3 pv2 mb2 ml2 dib bg-transparent"
              :class="[
                canSave == false
                  ? 'gray hover-gray hover-bg-transparent'
                  : 'link gold b--gold hover-white hover-bg-gold',
              ]"
              :disabled="!canSave"
              @click.prevent="prompt"
            >
              Save
            </button>
          </div>
          <div class="fl w-10-ns w-third tl">
            <button
              v-show="hasSavedTimes"
              class="br2 ba ph3 pv2 mb2 ml2 dib link gold b--gold hover-white hover-bg-gold bg-transparent"
              @click="savedTimes"
            >
              Times
            </button>
          </div>
          <div class="fl w-40-ns w-100 tr-ns tc">
            <button
              tabindex="6"
              class="br2 ba ph4-ns ph6 pv2 mb2 dib link white b--dark-red hover-white hover-bg-dark-red bg-dark-red"
            >
              Go !
            </button>
          </div>
        </div>
      </form>

      <modal
        :recipeName="recipeName"
        :developer="developer"
        :temperature="temperature"
        v-if="showModal"
        @close="showModal = false"
        @save="saveTime"
      >
        <template #header>
          <h3>New time</h3>
        </template>
        <template #body>
          <div class="fl w-100">
            <div class="fl w-20-ns w-100 pa2-ns ph2 mt3-ns mt2 tl">
              <label for="name">name</label>
            </div>

            <div class="fl w-70-ns ml2 pa2-ns w-100 tr-ns">
              <input
                type="text"
                v-model="recipeName"
                placeholder="name"
                class="input-reset pa1 mv2"
              />
            </div>
          </div>

          <div class="fl w-100">
            <div class="fl w-20-ns w-100 pa2-ns ph2 mt3-ns mt2 tl">
              <label for="temperature">temp</label>
            </div>

            <div class="fl w-70-ns ml2 pa2-ns w-100 tr-ns">
              <input
                v-model="temperature"
                placeholder="temperature"
                class="input-reset pa1"
              />
            </div>
          </div>

          <div class="fl w-100">
            <div class="fl w-20-ns w-100 pa2-ns ph2 mt3-ns mt2 tl">
              <label for="developer">developer</label>
            </div>

            <div class="fl w-70-ns ml2 pa2-ns w-100 tr-ns">
              <input
                type="text"
                v-model="developer"
                placeholder="developer"
                class="input-reset pa1"
              />
            </div>
          </div>
        </template>
        <template #footer>
          <div class="mw7 center ph3-ns">
            <div class="cf ph2-ns">
              <div class="fl w-100 mt2 ph2">
                Development time: {{ this.development }}min <br />
                Agitation: once every {{ this.inversion }}min <br />
              </div>
            </div>
          </div>
        </template>
      </modal>
    </div>
  </div>
</template>

<script>
import modal from "./Modal.vue";
import { isEmpty } from "lodash";

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
      temperature: null,
    };
  },
  components: {
    modal,
  },
  methods: {
    submit() {
      this.$refs.form.$el.submit();
    },
    startTimer() {
      localStorage.development = this.development * 60;
      localStorage.inversion = this.inversion * 60;
      localStorage.stop = this.stop * 60;
      localStorage.fix = this.fix * 60;
      localStorage.wash = this.wash * 60;

      this.$router.push({ name: "timer" });
    },
    reset() {
      this.development = null;
      this.inversion = null;
      this.stop = null;
      this.fix = null;
      this.wash = null;

      localStorage.removeItem("development");
      localStorage.removeItem("inversion");
      localStorage.removeItem("stop");
      localStorage.removeItem("fix");
      localStorage.removeItem("wash");
    },
    saveTime() {
      var recipes = localStorage.recipes;
      if (isEmpty(recipes)) {
        recipes = [this.recipeName];
      } else {
        recipes = JSON.parse(recipes);
        if (recipes.indexOf(this.recipeName) < 0) recipes.push(this.recipeName);
      }
      localStorage.recipes = JSON.stringify(recipes);
      localStorage.setItem(
        this.recipeName,
        JSON.stringify({
          development: this.development,
          fix: this.fix,
          inversion: this.inversion,
          stop: this.stop,
          wash: this.wash,
          developer: this.developer,
          temperature: this.temperature,
        }),
      );
      this.showModal = false;
      this.$router.push({ name: "times" });
    },
    prompt() {
      this.showModal = true;
    },
    savedTimes() {
      this.$router.push({ name: "times" });
    },
  },
  computed: {
    hasSavedTimes() {
      return !isEmpty(localStorage.recipes);
    },
    canSave() {
      return (
        parseInt(this.development) > 0 &&
        parseInt(this.inversion) > 0 &&
        parseInt(this.stop) > 0 &&
        parseInt(this.fix) > 0 &&
        parseInt(this.wash) > 0
      );
    },
  },
};
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
