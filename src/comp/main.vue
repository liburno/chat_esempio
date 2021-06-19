<template>
  <div class="max-w-5xl mx-auto min-h-screen bg-white text-gray-700 p-2 relative ">
      <div class="absolute top-0 left-0 w-64 bg-gray-500 text-white p-2 text-center text-xs opacity-50" v-if="connecting">{{connecting}}</div>
      <div class="absolute top-0 right-0 bg-green-400 text-white px-4 py-1 mt-1 text-xxs opacity-30  rounded-lg" v-if="istyping" >...{{typingname}}</div>
      <div class="flex mt-3">
        <label class="mx-5 py-2 w-24">Utente:</label>
        <div class="flex flex-1" v-if="logged">
            <div class="text-3xl flex-1">{{utente}}</div>
            <button class="btn" @click="logout()">Logout</button>
     
        </div>
        <div class="flex flex-1" v-else>
            <input type="text" class="block px-4 flex-1 border border-gray-400" v-model="utente">
            <button class="btn" @click="login()">Login</button>
        </div>
        <router-link class="btn" to="/altra">to altra</router-link>
      </div>
      <div v-if="logged">
        <div class="flex mt-2">
            <label class="mx-5 py-2 w-24">Dest:</label>
            <input type="text" class="block px-4 flex-1 border border-gray-400" v-model="dest">
            <label class="mx-2 py-4 text-xs">Privato:</label>
            <input type="checkbox" class="mr-2" v-model="privato">
          </div>
          <div class="flex mt-2">
            <label class="mx-5 py-2 w-24">Messaggio:</label>
            <textarea class="block flex-1 px-4 py-1 border border-gray-400" v-model="messaggio" @focus="scrive(true)" @blur="scrive(false)"/>
            <button class="btn my-4 " @click="invia()">Send</button>
          
        </div>
        <div class="mt-3"></div>
        <div class="mt-1 flex" v-for="(m,k) in messaggi" :key="k">
           <div class="flex-1" v-if="utente==m.user"/>
          
           <div class="rounded-lg text-white p-2 text-sm" :class="m.private?'bg-orange-700':'bg-green-600 '" v-if="utente==m.user">
              <p class="text-xxs block text-right">
                  <span class="ml-2 text-gray-300" >{{m.rowid}} {{filtro.time(m.date)}}</span>
              </p>
              <p v-if="m.private" class="text-xxs block text-right text-red-300 bold">private to: {{m.dest}}</p>
              <p class="whitespace-pre-line">{{m.text}}</p>
           </div>
           <div class="rounded-lg text-white p-2 text-sm" :class="m.private?'bg-orange-400':'bg-blue-400 '" v-else>
              <p class="text-xxs">
                  <span class="bold" >{{m.user}}</span>
                  <span class="ml-2 text-gray-300" >{{m.rowid}} {{filtro.time(m.date)}}</span>
              </p>
              <p v-if="m.private" class="text-xxs   text-red-300 bold">private from: {{m.user}}</p>
              <p class="whitespace-pre-line">{{m.text}}</p>
           </div>
          </div>
      </div>
      
  </div>
</template>

<script>
import { post } from "@eng/post";
import { getStorage, setStorage } from "@eng/utils";
import { io } from "socket.io-client";
var ii = 0;
export default {
  methods: {
    login() {
        if (this.socket && this.utente) {
           this.logged=true;
           this.socket.emit('login',this.utente);
           setStorage("utente",this.utente);
        }
    },
    logout() {
      this.logged=false;
      if (this.socket) {
         this.socket.emit('logout');

      }
    },
    scrive(mode) {
      if (this.socket) {
         this.socket.emit('typing',mode);
      }
    },
    invia() {
      if (this.socket) {
          var tm={
             rowid:0,
             data:new Date().toFloat(),
             user: this.utente,
             dest: this.dest,
             private:this.privato,
             text:this.messaggio
          };

          this.socket.emit('newmsg',tm)
          this.messaggi.unshift(tm);
          this.messaggio='';
          this.to='';
          this.privato='0';
      }
    },
  

  },
  created () {
      this.utente=getStorage("utente","");
      this.socket=io(post.baseurl);
      if (this.utente) this.login();
      this.socket.on("access",data=>{
        this.connecting=`${data.value?'login: ':'logout: '}${data.name}`
        setTimeout(()=>{
          this.connecting=''
        },2000);
      })
      this.socket.on("istyping",data=>{
          this.typingname=data.name;
          this.istyping=data.mode;
      })
      this.socket.on("addmsg",data=>{
        this.messaggi.unshift(data);
      
      })

      this.socket.on("messages",data=>{
          this.messaggi=data;
      })
  },
  beforeUnmount() {
     // sconnetti
     if (this.socket) {
       this.socket.emit('logout');
       this.socket.disconnect();
       this.socket=null
     }
  },
  data() {
    return {
      messaggi: [],
      istyping:0,
      typingname:'',
      logged:false,
      dest:'',
      privato:"0",
      messaggio:'',
      connecting:'',
      utente:'gialli',      
      post,
      socket:null
    };
  },
};
</script>
