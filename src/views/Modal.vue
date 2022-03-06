<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header"> default header </slot>
          </div>

          <div class="modal-body">
            <slot name="body"> default body </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"> default footer </slot>
            <slot name="button">
                <div class="mw7 center ph3-ns mt2">
                  <div class="cf ph2-ns">
                    <div class="fl w-100">
                      <div class="fl w-50-ns pa2 mt2">
                        <button
                        class="br2 ba ph3 pv2 mb2 ml2 dib"
                        :class="[noInput == true ? 'gray hover-gray hover-bg-transparent bg-transparent' : 'link bg-navy b--navy hover-white white hover-bg-navy']"
                        :disabled="noInput"
                        @click="$emit('save')"
                        >
                          OK
                        </button>
                      </div>

                      <div class="fl w-50-ns pa2 mt2">
                        <button 
                          class="br2 ba ph3 pv2 mb2 dib link black-80 b--black-80 hover-white hover-bg-black bg-transparent"
                          @click="$emit('close')">
                          cancel
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { isEmpty, isNaN } from 'lodash'

export default {
  name: 'modal',
  computed: {
    noInput() {
      return (
        isEmpty(this.$attrs.recipeName) ||
        isEmpty(this.$attrs.temperature) ||
        isNaN(parseInt(this.$attrs.temperature)) ||
        isEmpty(this.$attrs.developer) 
      )
    },
  },
  methods: {},
}
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 400px;
  height: 400px;
  margin: 0px auto;
  padding: 20px 20px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: "meta", sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
