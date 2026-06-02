// NEXUS shared auth + helpers (localStorage-based)
(function(){
  const USERS_KEY = 'nexus_users';
  const SESSION_KEY = 'nexus_session';
  const LINKS_KEY = 'nexus_links';

  function getUsers(){ try{return JSON.parse(localStorage.getItem(USERS_KEY))||{}}catch(e){return{}} }
  function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function hash(s){
    let h = 5381; for (let i=0;i<s.length;i++) h = ((h<<5)+h) + s.charCodeAt(i);
    return 'h'+(h>>>0).toString(16);
  }

  window.NEXUS = {
    register({email, password}){
      email = (email||'').trim().toLowerCase();
      if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email tidak valid');
      if(!password || password.length < 6) throw new Error('Password minimal 6 karakter');
      const users = getUsers();
      if(users[email]) throw new Error('Email sudah terdaftar');
      users[email] = { pw: hash(password), created: Date.now() };
      saveUsers(users);
      this.setSession(email);
      return email;
    },
    login({email, password}){
      email = (email||'').trim().toLowerCase();
      const users = getUsers();
      const u = users[email];
      if(!u || u.pw !== hash(password)) throw new Error('Email atau password salah');
      this.setSession(email);
      return email;
    },
    setSession(email){
      localStorage.setItem(SESSION_KEY, JSON.stringify({email, at:Date.now()}));
    },
    getSession(){
      try{return JSON.parse(localStorage.getItem(SESSION_KEY))}catch(e){return null}
    },
    logout(){ localStorage.removeItem(SESSION_KEY); },
    requireAuth(redirect){
      const s = this.getSession();
      if(!s){ window.location.href = redirect || '/login.html'; return null; }
      return s;
    },

    // Links
    getLinks(){ try{return JSON.parse(localStorage.getItem(LINKS_KEY))||[]}catch(e){return[]} },
    addLink(url){
      const list = this.getLinks();
      const id = Math.random().toString(36).slice(2,10);
      list.unshift({id, url, created: Date.now()});
      localStorage.setItem(LINKS_KEY, JSON.stringify(list.slice(0,50)));
      return id;
    },
    deleteLink(id){
      const list = this.getLinks().filter(x=>x.id!==id);
      localStorage.setItem(LINKS_KEY, JSON.stringify(list));
    },
    buildGateUrl(targetUrl){
      const base = window.location.origin;
      return base + '/go?to=' + encodeURIComponent(targetUrl);
    }
  };
})();
