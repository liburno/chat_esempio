import { createRouter,createWebHistory } from 'vue-router'
import {bus } from '@eng/bus';
import Main from "@comp/main.vue"
import Altra from "@comp/altra.vue"

const routes = [
  { path: '/', component: Main },
  { path: '/altra', component: Altra },
]

export const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
})

